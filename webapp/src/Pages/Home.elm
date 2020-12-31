module Pages.Home exposing (Model, Msg(..), init, subscriptions, toSession, update, view)

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
    , form : Exercise.Builder
    , submit : RemoteData String Exercise
    }


type Msg
    = InputProblem String
    | InputDistortion Distortion Bool
    | InputChallenge String
    | InputAlternative String
    | Submit
    | SubmitResponse (Result String Exercise.Response)
    | Noop


init : Session -> ( Model, Cmd Msg )
init session =
    ( { session = session
      , form = Exercise.empty
      , submit = RemoteData.NotAsked
      }
    , Cmd.none
    )


toSession : Model -> Session
toSession m =
    m.session


update : Msg -> Model -> ( Model, Cmd Msg )
update msg ({ form } as model) =
    case msg of
        InputProblem input ->
            ( { model | form = { form | problem = input } }, Cmd.none )

        InputDistortion dis True ->
            ( { model | form = { form | distortions = form.distortions |> Set.insert dis.id } }, Cmd.none )

        InputDistortion dis False ->
            ( { model | form = { form | distortions = form.distortions |> Set.remove dis.id } }, Cmd.none )

        InputChallenge input ->
            ( { model | form = { form | challenge = input } }, Cmd.none )

        InputAlternative input ->
            ( { model | form = { form | alternative = input } }, Cmd.none )

        Submit ->
            ( { model | form = Exercise.empty, submit = RemoteData.Loading }, model.form |> Exercise.PostReq |> Exercise.request )

        SubmitResponse res ->
            case res of
                Ok (Exercise.PostRes e) ->
                    ( { model | submit = RemoteData.Success e }, Route.pushUrl model.session.nav Route.List )

                Ok _ ->
                    ( { model | submit = RemoteData.Failure "unexpected response method" }, Cmd.none )

                Err err ->
                    ( { model | submit = RemoteData.Failure err }, Cmd.none )

        Noop ->
            ( model, Cmd.none )


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.batch
        [ Exercise.response SubmitResponse
        ]


view : Model -> List (Html Msg)
view ({ form } as model) =
    [ h1 [] [ text "FreeCBT-web (beta)" ]
    , H.form [ onSubmit Submit ]
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
            case model.submit of
                RemoteData.Loading ->
                    [ text "loading..." ]

                RemoteData.Failure err ->
                    [ code [] [ text err ] ]

                _ ->
                    []

        -- , details [] [ summary [] [ text "dump" ], pre [] [ text <| Debug.toString model ] ]
        , div [] [ a [ Route.href Route.List ] [ text "List" ] ]
        ]
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
