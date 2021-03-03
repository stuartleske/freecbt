module Pages.Edit exposing (Model, Msg(..), init, subscriptions, toSession, update, updateSession, view)

import Exercise exposing (Distortion, Exercise)
import Html as H exposing (..)
import Html.Attributes as A exposing (..)
import Html.Events as E exposing (..)
import I18N as L
import Json.Decode as D
import RemoteData exposing (RemoteData)
import Route exposing (Route)
import Session exposing (Session)
import Set exposing (Set)


type alias Model =
    { session : Session
    , form : RemoteData String Exercise
    , deletePrompt : Bool
    , submit : RemoteData String ()
    }


type Msg
    = InputProblem String
    | InputDistortion Distortion Bool
    | InputChallenge String
    | InputAlternative String
    | DeleteStart
    | DeleteCancel
    | DeleteConfirm
    | Submit
    | Response (Result String Exercise.Response)


init : Exercise.Id -> Session -> ( Model, Cmd Msg )
init id session =
    ( { session = session
      , form = RemoteData.Loading
      , deletePrompt = False
      , submit = RemoteData.NotAsked
      }
    , Exercise.request <| Exercise.GetReq id
    )


toSession : Model -> Session
toSession m =
    m.session


updateSession : Session -> Model -> Model
updateSession s m =
    { m | session = s }


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case model.form of
        RemoteData.Success form ->
            case msg of
                InputProblem input ->
                    ( { model | form = RemoteData.Success { form | problem = input } }, Cmd.none )

                InputDistortion dis True ->
                    ( { model | form = RemoteData.Success { form | distortions = form.distortions |> Set.insert dis.id } }, Cmd.none )

                InputDistortion dis False ->
                    ( { model | form = RemoteData.Success { form | distortions = form.distortions |> Set.remove dis.id } }, Cmd.none )

                InputChallenge input ->
                    ( { model | form = RemoteData.Success { form | challenge = input } }, Cmd.none )

                InputAlternative input ->
                    ( { model | form = RemoteData.Success { form | alternative = input } }, Cmd.none )

                Submit ->
                    ( { model | submit = RemoteData.Loading }, form |> Exercise.PutReq |> Exercise.request )

                DeleteStart ->
                    ( { model | deletePrompt = True }, Cmd.none )

                DeleteCancel ->
                    ( { model | deletePrompt = False }, Cmd.none )

                DeleteConfirm ->
                    ( { model | deletePrompt = False, submit = RemoteData.Loading }, form.id |> Exercise.DeleteReq |> Exercise.request )

                Response res ->
                    case res of
                        Ok (Exercise.PutRes e) ->
                            -- ( { model | submit = RemoteData.Success () }, Cmd.none )
                            ( { model | submit = RemoteData.Success () }, Route.pushUrl model.session.nav Route.List )

                        Ok (Exercise.DeleteRes e) ->
                            ( { model | form = RemoteData.NotAsked, submit = RemoteData.Success () }, Route.pushUrl model.session.nav Route.List )

                        Ok _ ->
                            ( { model | submit = RemoteData.Failure "unexpected response method" }, Cmd.none )

                        Err err ->
                            ( { model | submit = RemoteData.Failure err }, Cmd.none )

        _ ->
            case msg of
                Response res ->
                    case res of
                        Ok (Exercise.GetRes (Just e)) ->
                            ( { model | form = RemoteData.Success e }, Cmd.none )

                        Ok (Exercise.GetRes Nothing) ->
                            ( { model | form = RemoteData.Failure "no such exercise" }, Cmd.none )

                        Ok _ ->
                            ( { model | form = RemoteData.Failure "unexpected response method" }, Cmd.none )

                        Err err ->
                            ( { model | form = RemoteData.Failure err }, Cmd.none )

                _ ->
                    ( model, Cmd.none )


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.batch
        [ Exercise.response Response
        ]


view : Model -> List (Html Msg)
view model =
    [ h1 [] [ text "FreeCBT-web (beta)" ]
    , H.form [ onSubmit Submit ] <| viewForm model

    -- , details [] [ summary [] [ text "dump" ], pre [] [ text <| Debug.toString model ] ]
    , div [] [ a [ Route.href Route.List ] [ text "List" ] ]
    ]


viewForm : Model -> List (Html Msg)
viewForm model =
    case model.form of
        RemoteData.NotAsked ->
            []

        RemoteData.Loading ->
            [ text "loading..." ]

        RemoteData.Failure err ->
            [ code [] [ text err ] ]

        RemoteData.Success form ->
            [ div []
                [ label [ for "problem" ]
                    [ L.message "auto_thought" ]
                , L.element [ ( "placeholder", "cbt_form.auto_thought_placeholder" ) ] [] <|
                    textarea
                        [ id "problem"
                        , onInput InputProblem
                        ]
                        [ text form.problem ]
                ]
            , details [ A.attribute "open" "true" ]
                (summary []
                    [ L.message "cog_distortion"
                    , span [ class "distortion-icons" ]
                        [ Exercise.icons form |> String.join " " |> text ]
                    ]
                    :: (Exercise.distortions |> List.map (viewDistortion form.distortions))
                )
            , div []
                [ label [ for "challenge" ]
                    [ L.message "challenge" ]
                , L.element [ ( "placeholder", "cbt_form.changed_placeholder" ) ] [] <|
                    textarea
                        [ id "challenge"
                        , onInput InputChallenge
                        ]
                        [ text form.challenge
                        ]
                ]
            , div []
                [ label [ for "alternative" ]
                    [ L.message "alt_thought" ]
                , L.element [ ( "placeholder", "cbt_form.alt_thought_placeholder" ) ] [] <|
                    textarea
                        [ id "alternative"
                        , onInput InputAlternative
                        ]
                        [ text form.alternative ]
                ]
            , div [] [ button [ type_ "submit", disabled <| RemoteData.isLoading model.submit ] [ text "Save" ] ]
            , div [] <|
                if model.deletePrompt then
                    [ div [] [ text "Really delete this? There is no undo. " ]
                    , button [ type_ "button", disabled <| RemoteData.isLoading model.submit, onClick DeleteCancel ] [ text "No, save me" ]
                    , button [ type_ "button", disabled <| RemoteData.isLoading model.submit, onClick DeleteConfirm ] [ text "Yes, delete permanently" ]
                    ]

                else
                    [ button [ type_ "button", disabled <| RemoteData.isLoading model.submit, onClick DeleteStart ] [ text "Delete..." ] ]
            , div [] <|
                case model.submit of
                    RemoteData.Loading ->
                        [ text "loading..." ]

                    RemoteData.Failure err ->
                        [ code [] [ text err ] ]

                    _ ->
                        []
            ]


viewDistortion : Set String -> Distortion -> Html Msg
viewDistortion checks dis =
    let
        idfull =
            "distortions-" ++ dis.id

        val =
            Set.member dis.id checks
    in
    div []
        [ label [ for idfull ]
            [ div []
                [ input
                    [ type_ "checkbox"
                    , id idfull
                    , checked val
                    , onClick <| InputDistortion dis <| not val
                    ]
                    []
                , text <| dis.icon ++ " "
                , L.message dis.id
                ]

            -- awkward, but we have to match existing message ids
            , div [] [ i [] [ L.message <| String.replace "over_generalization" "overgeneralization" dis.id ++ "_one_liner" ] ]
            ]
        ]
