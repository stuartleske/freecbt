module Pages.List exposing (Model, Msg(..), init, subscriptions, toSession, update, view)

import Exercise exposing (Distortion, Exercise)
import Html as H exposing (..)
import Html.Attributes as A exposing (..)
import Html.Events as E exposing (..)
import Json.Decode as D
import RemoteData exposing (RemoteData)
import Route exposing (Route)
import Session exposing (Session)


type alias Model =
    { session : Session
    , exercises : RemoteData String (List Exercise)
    }


type Msg
    = ListResponse (Result String Exercise.Response)


init : Session -> ( Model, Cmd Msg )
init session =
    ( { session = session, exercises = RemoteData.Loading }
    , Exercise.request Exercise.ListReq
    )


toSession : Model -> Session
toSession m =
    m.session


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        ListResponse res ->
            let
                items =
                    case res of
                        Ok (Exercise.ListRes es) ->
                            RemoteData.Success es

                        Ok _ ->
                            RemoteData.Failure "unexpected response method"

                        Err err ->
                            RemoteData.Failure err
            in
            ( { model | exercises = items }, Cmd.none )


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.batch
        [ Exercise.response ListResponse
        ]


view : Model -> List (Html Msg)
view model =
    [ h1 [] [ text "FreeCBT-web (beta)" ]
    , h3 [] [ text "List" ]
    , div [] <|
        case model.exercises of
            RemoteData.Success [] ->
                [ text "empty" ]

            RemoteData.Success data ->
                [ data |> List.map (viewItem >> li []) |> ul [] ]

            RemoteData.Failure err ->
                [ code [] [ text err ] ]

            _ ->
                [ text "loading..." ]
    , div [] [ a [ Route.href Route.Home ] [ text "New" ] ]
    ]


viewItem : Exercise -> List (Html msg)
viewItem ex =
    [ a [ Route.href <| Route.Edit ex.id ]
        [ div [] [ Exercise.icons ex |> String.join " " |> text ]
        , div []
            [ text <|
                if String.trim ex.alternative /= "" then
                    ex.alternative

                else
                    "\u{1F937}"
            ]
        ]
    ]
