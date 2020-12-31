module Main exposing (..)

import Browser
import Browser.Navigation as Nav
import Html as H exposing (..)
import Html.Attributes as A exposing (..)
import Html.Events as E exposing (..)
import I18N
import Json.Encode as Json
import Pages.Debug
import Pages.Edit
import Pages.Home
import Pages.List
import Pages.NotFound
import Route exposing (Route)
import Session exposing (Session)
import Url exposing (Url)



---- MODEL ----


type Model
    = Home Pages.Home.Model
    | List Pages.List.Model
    | Edit Pages.Edit.Model
    | Debug Pages.Debug.Model
    | NotFound Session


type alias Flags =
    { i18nBundle : Json.Value }


init : Flags -> Url -> Nav.Key -> ( Model, Cmd Msg )
init flags url nav =
    let
        session =
            Session.init (Just nav) flags.i18nBundle
    in
    routeTo (Route.parse url) (NotFound session)


toSession : Model -> Session
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

        Debug pgmodel ->
            Pages.Debug.toSession pgmodel


routeTo : Maybe Route -> Model -> ( Model, Cmd Msg )
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

                    Just Route.Debug ->
                        Pages.Debug.init session |> Tuple.mapBoth Debug (Cmd.map DebugMsg)
           )



---- UPDATE ----


type Msg
    = OnUrlRequest Browser.UrlRequest
    | OnUrlChange Url
    | HomeMsg Pages.Home.Msg
    | ListMsg Pages.List.Msg
    | EditMsg Pages.Edit.Msg
    | DebugMsg Pages.Debug.Msg


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
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
        NotFound session ->
            Sub.none

        Home pgmodel ->
            Pages.Home.subscriptions pgmodel |> Sub.map HomeMsg

        List pgmodel ->
            Pages.List.subscriptions pgmodel |> Sub.map ListMsg

        Edit pgmodel ->
            Pages.Edit.subscriptions pgmodel |> Sub.map EditMsg

        Debug pgmodel ->
            Pages.Debug.subscriptions pgmodel |> Sub.map DebugMsg



---- VIEW ----


view : Model -> Browser.Document Msg
view model =
    { title = "Elm Application"
    , body =
        [ I18N.provider (toSession model).i18nBundle <|
            case model of
                NotFound session ->
                    Pages.NotFound.view session

                Home pgmodel ->
                    Pages.Home.view pgmodel |> List.map (H.map HomeMsg)

                List pgmodel ->
                    Pages.List.view pgmodel |> List.map (H.map ListMsg)

                Edit pgmodel ->
                    Pages.Edit.view pgmodel |> List.map (H.map EditMsg)

                Debug pgmodel ->
                    Pages.Debug.view pgmodel |> List.map (H.map DebugMsg)
        ]
    }



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
