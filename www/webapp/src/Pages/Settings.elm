module Pages.Settings exposing (Model, Msg(..), init, subscriptions, toSession, update, updateSession, view)

import Dict exposing (Dict)
import Html as H exposing (..)
import Html.Attributes as A exposing (..)
import Html.Events as E exposing (..)
import I18N as L
import Ports
import RemoteData exposing (RemoteData)
import Route exposing (Route)
import Session exposing (Session)
import Settings exposing (Settings)


type alias Model =
    { session : Session }


type Msg
    = OnLocaleChange String


init : Session -> ( Model, Cmd Msg )
init session =
    ( { session = session }, Cmd.none )


toSession : Model -> Session
toSession m =
    m.session


updateSession : Session -> Model -> Model
updateSession s m =
    { m | session = s }


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case model.session.settings of
        RemoteData.Success settings ->
            case msg of
                OnLocaleChange raw ->
                    let
                        l =
                            if raw == "" then
                                Nothing

                            else
                                Just raw
                    in
                    ( model, Ports.settingsPush <| Settings.encoder { settings | locale = l } )

        _ ->
            ( model, Cmd.none )


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.none


view : Model -> List (Html Msg)
view model =
    case model.session.settings of
        RemoteData.Success settings ->
            [ h1 [] [ L.message "settings.header" ]
            , div []
                [ label [ value "" ] [ L.message "settings.locale.header" ]
                , select [ onInput OnLocaleChange ]
                    (option [] [ L.message "settings.locale.default" ]
                        :: (Dict.keys model.session.translations
                                |> List.map
                                    (\l ->
                                        option [ value l ] [ L.message <| "settings.locale.list." ++ l ]
                                    )
                           )
                    )
                ]
            , div [] [ a [ Route.href Route.Home ] [ text "Home" ] ]
            ]

        RemoteData.Failure err ->
            [ h1 [] [ L.message "settings.header" ]
            , code [] [ text err ]
            ]

        _ ->
            [ code [] [ text "loading..." ] ]
