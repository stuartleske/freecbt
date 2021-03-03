module Settings exposing (Settings, decoder, encoder)

import Json.Decode as D
import Json.Encode as E
import Maybe.Extra


type alias Settings =
    { locale : Maybe String }


empty : Settings
empty =
    { locale = Nothing }


decoder : D.Decoder Settings
decoder =
    D.oneOf
        [ D.map Settings
            (D.field "locale" <| D.maybe D.string)
        , D.null empty
        ]


encoder : Settings -> E.Value
encoder s =
    E.object [ ( "locale", s.locale |> encodeMaybe E.string ) ]


encodeMaybe : (x -> E.Value) -> Maybe x -> E.Value
encodeMaybe =
    Maybe.Extra.unwrap E.null
