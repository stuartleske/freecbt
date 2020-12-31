module Route exposing (Route(..), href, parse, pushUrl, replaceUrl, toString)

import Browser.Navigation as Nav
import Html as H
import Html.Attributes as A
import Url exposing (Url)
import Url.Parser as P exposing ((</>), (<?>), Parser)


type Route
    = Home
    | List
    | Edit String
    | Debug


parse : Url -> Maybe Route
parse =
    P.parse parser


parser : Parser (Route -> a) a
parser =
    P.s "webapp"
        </> P.oneOf
                [ P.map Home P.top
                , P.map List <| P.s "list"
                , P.map Edit <| P.s "edit" </> P.string
                , P.map Debug <| P.s "debug"
                ]


toString : Route -> String
toString route =
    "/webapp"
        ++ (case route of
                Home ->
                    "/"

                List ->
                    "/list"

                Edit id ->
                    "/edit/" ++ id

                Debug ->
                    "/debug"
           )


href : Route -> H.Attribute msg
href =
    toString >> A.href


pushUrl : Maybe Nav.Key -> Route -> Cmd msg
pushUrl mnav route =
    case mnav of
        Nothing ->
            Cmd.none

        Just nav ->
            route |> toString |> Nav.pushUrl nav


replaceUrl : Maybe Nav.Key -> Route -> Cmd msg
replaceUrl mnav route =
    case mnav of
        Nothing ->
            Cmd.none

        Just nav ->
            route |> toString |> Nav.replaceUrl nav
