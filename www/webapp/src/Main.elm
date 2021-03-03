module Main exposing (..)

import Browser
import Browser.Navigation as Nav
import Dict exposing (Dict)
import Html as H exposing (..)
import Html.Attributes as A exposing (..)
import Html.Events as E exposing (..)
import I18N
import Json.Decode as D
import Json.Encode as Json
import Pages.Debug
import Pages.Edit
import Pages.Home
import Pages.List
import Pages.NotFound
import Pages.Settings
import Ports
import RemoteData exposing (RemoteData)
import Route exposing (Route)
import Session exposing (Session)
import Settings exposing (Settings)
import Url exposing (Url)



---- MODEL ----


type alias Model =
    Result String OkModel


type OkModel
    = Home Pages.Home.Model
    | List Pages.List.Model
    | Edit Pages.Edit.Model
    | Settings Pages.Settings.Model
    | Debug Pages.Debug.Model
    | NotFound Session


type alias Flags =
    Json.Value


init : Flags -> Url -> Nav.Key -> ( Model, Cmd Msg )
init flags url nav =
    case Session.init (Just nav) flags of
        Err err ->
            ( Err err, Cmd.none )

        Ok session ->
            routeTo (Route.parse url) (NotFound session)
                |> Tuple.mapFirst Ok


toSession : OkModel -> Session
toSession model =
    case model of
        NotFound session ->
            session

        Home pgmodel ->
            Pages.Home.toSession pgmodel

        List pgmodel ->
            Pages.List.toSession pgmodel

        Edit pgmodel ->
            Pages.Edit.toSession pgmodel

        Settings pgmodel ->
            Pages.Settings.toSession pgmodel

        Debug pgmodel ->
            Pages.Debug.toSession pgmodel


updateSession : Session -> OkModel -> OkModel
updateSession session model =
    case model of
        NotFound _ ->
            NotFound session

        Home pgmodel ->
            Home <| Pages.Home.updateSession session pgmodel

        List pgmodel ->
            List <| Pages.List.updateSession session pgmodel

        Edit pgmodel ->
            Edit <| Pages.Edit.updateSession session pgmodel

        Settings pgmodel ->
            Settings <| Pages.Settings.updateSession session pgmodel

        Debug pgmodel ->
            Debug <| Pages.Debug.updateSession session pgmodel


routeTo : Maybe Route -> OkModel -> ( OkModel, Cmd Msg )
routeTo mroute =
    toSession
        >> (\session ->
                case mroute of
                    Nothing ->
                        ( NotFound session, Cmd.none )

                    Just Route.Home ->
                        Pages.Home.init session |> Tuple.mapBoth Home (Cmd.map HomeMsg)

                    Just Route.List ->
                        Pages.List.init session |> Tuple.mapBoth List (Cmd.map ListMsg)

                    Just (Route.Edit id) ->
                        Pages.Edit.init id session |> Tuple.mapBoth Edit (Cmd.map EditMsg)

                    Just Route.Settings ->
                        Pages.Settings.init session |> Tuple.mapBoth Settings (Cmd.map SettingsMsg)

                    Just Route.Debug ->
                        Pages.Debug.init session |> Tuple.mapBoth Debug (Cmd.map DebugMsg)
           )



---- UPDATE ----


type Msg
    = OnUrlRequest Browser.UrlRequest
    | OnUrlChange Url
    | OnSettingsUpdate Json.Value
    | HomeMsg Pages.Home.Msg
    | ListMsg Pages.List.Msg
    | EditMsg Pages.Edit.Msg
    | SettingsMsg Pages.Settings.Msg
    | DebugMsg Pages.Debug.Msg


update : Msg -> Model -> ( Model, Cmd Msg )
update msg mmodel =
    case mmodel of
        Err _ ->
            ( mmodel, Cmd.none )

        Ok model ->
            Tuple.mapFirst Ok <|
                case msg of
                    OnUrlChange url ->
                        routeTo (Route.parse url) model

                    OnUrlRequest (Browser.Internal url) ->
                        case (toSession model).nav of
                            Nothing ->
                                -- This should only happen in unit tests! See the note about Nav.Key in Session.init
                                ( model, Cmd.none )

                            Just nav ->
                                ( model, url |> Url.toString |> Nav.pushUrl nav )

                    OnUrlRequest (Browser.External urlstr) ->
                        ( model, Nav.load urlstr )

                    OnSettingsUpdate json ->
                        case D.decodeValue (D.field "data" Settings.decoder) json of
                            Err err ->
                                let
                                    s =
                                        toSession model
                                in
                                ( model |> updateSession { s | settings = RemoteData.Failure <| D.errorToString err }, Cmd.none )

                            Ok settings ->
                                let
                                    s =
                                        toSession model
                                in
                                ( model |> updateSession { s | settings = RemoteData.Success settings }, Cmd.none )

                    HomeMsg pgmsg ->
                        case model of
                            Home pgmodel ->
                                Pages.Home.update pgmsg pgmodel |> Tuple.mapBoth Home (Cmd.map HomeMsg)

                            _ ->
                                ( model, Cmd.none )

                    ListMsg pgmsg ->
                        case model of
                            List pgmodel ->
                                Pages.List.update pgmsg pgmodel |> Tuple.mapBoth List (Cmd.map ListMsg)

                            _ ->
                                ( model, Cmd.none )

                    EditMsg pgmsg ->
                        case model of
                            Edit pgmodel ->
                                Pages.Edit.update pgmsg pgmodel |> Tuple.mapBoth Edit (Cmd.map EditMsg)

                            _ ->
                                ( model, Cmd.none )

                    SettingsMsg pgmsg ->
                        case model of
                            Settings pgmodel ->
                                Pages.Settings.update pgmsg pgmodel |> Tuple.mapBoth Settings (Cmd.map SettingsMsg)

                            _ ->
                                ( model, Cmd.none )

                    DebugMsg pgmsg ->
                        case model of
                            Debug pgmodel ->
                                Pages.Debug.update pgmsg pgmodel |> Tuple.mapBoth Debug (Cmd.map DebugMsg)

                            _ ->
                                ( model, Cmd.none )



---- SUBSCRIPTIONS ----


subscriptions : Model -> Sub Msg
subscriptions model =
    case model of
        Err _ ->
            Sub.none

        Ok ok ->
            Sub.batch
                [ Ports.settingsPull OnSettingsUpdate
                , case ok of
                    NotFound _ ->
                        Sub.none

                    Home pgmodel ->
                        Pages.Home.subscriptions pgmodel |> Sub.map HomeMsg

                    List pgmodel ->
                        Pages.List.subscriptions pgmodel |> Sub.map ListMsg

                    Edit pgmodel ->
                        Pages.Edit.subscriptions pgmodel |> Sub.map EditMsg

                    Settings pgmodel ->
                        Pages.Settings.subscriptions pgmodel |> Sub.map SettingsMsg

                    Debug pgmodel ->
                        Pages.Debug.subscriptions pgmodel |> Sub.map DebugMsg
                ]



---- VIEW ----


view : Model -> Browser.Document Msg
view mmodel =
    { title = "Elm Application"
    , body =
        case mmodel of
            Err err ->
                [ code [] [ text err ] ]

            Ok model ->
                [ viewI18NProvider (toSession model) <|
                    case model of
                        NotFound session ->
                            Pages.NotFound.view session

                        Home pgmodel ->
                            Pages.Home.view pgmodel |> List.map (H.map HomeMsg)

                        List pgmodel ->
                            Pages.List.view pgmodel |> List.map (H.map ListMsg)

                        Edit pgmodel ->
                            Pages.Edit.view pgmodel |> List.map (H.map EditMsg)

                        Settings pgmodel ->
                            Pages.Settings.view pgmodel |> List.map (H.map SettingsMsg)

                        Debug pgmodel ->
                            Pages.Debug.view pgmodel |> List.map (H.map DebugMsg)
                ]
    }


viewI18NProvider : Session -> List (Html msg) -> Html msg
viewI18NProvider session =
    session.settings
        |> RemoteData.toMaybe
        |> Maybe.andThen .locale
        |> I18N.provider



---- PROGRAM ----


main : Program Flags Model Msg
main =
    Browser.application
        { view = view
        , init = init
        , update = update
        , subscriptions = subscriptions
        , onUrlChange = OnUrlChange
        , onUrlRequest = OnUrlRequest
        }
