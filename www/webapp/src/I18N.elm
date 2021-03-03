module I18N exposing (element, message, provider)

import Html as H exposing (..)
import Html.Attributes as A exposing (..)
import Json.Encode as Json


provider : Maybe String -> List (Html msg) -> Html msg
provider locale =
    H.node "i18n-provider" [ A.attribute "locale" <| Maybe.withDefault "" locale ]


message : String -> Html msg
message messageId =
    H.node "i18n-message" [ A.attribute "messageid" messageId ] []


element : List ( String, String ) -> List ( String, String ) -> Html msg -> Html msg
element attributes properties el =
    H.node "i18n-element"
        [ A.property "messageAttributes" <| pairsEncoder attributes
        , A.property "messageProperties" <| pairsEncoder properties
        ]
        [ el ]


pairsEncoder : List ( String, String ) -> Json.Value
pairsEncoder =
    List.map (\( a, b ) -> Json.list Json.string [ a, b ]) >> Json.list identity
