module Pages.Debug exposing (Model, Msg(..), init, subscriptions, toSession, update, view)

import Html as H exposing (..)
import Html.Attributes as A exposing (..)
import Html.Events as E exposing (..)
import Route exposing (Route)
import Session exposing (Session)


type alias Model =
    { session : Session }


type Msg
    = Noop


init : Session -> ( Model, Cmd Msg )
init session =
    ( { session = session }, Cmd.none )


toSession : Model -> Session
toSession m =
    m.session


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        Noop ->
            ( model, Cmd.none )


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.none


view : Model -> List (Html Msg)
view model =
    [ h1 [] [ text "FreeCBT-web (beta)" ]
    , h3 [] [ text "Debug info" ]

    -- , div [] [ text <| Debug.toString model.session ]
    , div [] [ text "..." ]
    , div [] [ a [ Route.href Route.Home ] [ text "Home" ] ]
    ]
