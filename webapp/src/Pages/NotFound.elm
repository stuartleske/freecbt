module Pages.NotFound exposing (view)

import Html as H exposing (..)
import Html.Attributes as A exposing (..)
import Html.Events as E exposing (..)
import Route exposing (Route)
import Session exposing (Session)


view : Session -> List (Html msg)
view _ =
    [ div [] [ text "Not found" ]
    , div [] [ a [ Route.href Route.Home ] [ text "Home" ] ]
    ]
