module Session exposing (Session, init)

import Browser.Navigation as Nav
import Dict exposing (Dict)
import Json.Decode as D
import RemoteData exposing (RemoteData)
import Settings exposing (Settings)


type alias Session =
    -- Nav.Key cannot be unit tested; Maybe Nav.Key is a workaround.
    -- See https://github.com/elm-explorations/test/issues/24
    { nav : Maybe Nav.Key
    , settings : RemoteData String Settings
    , defaultLocale : String
    , translations : Dict String D.Value
    }


type alias Flags =
    { defaultLocale : String, translations : Dict String D.Value }


init : Maybe Nav.Key -> D.Value -> Result String Session
init nav rawflags =
    case D.decodeValue decodeFlags rawflags of
        Err err ->
            err |> D.errorToString |> Err

        Ok flags ->
            Session nav RemoteData.NotAsked flags.defaultLocale flags.translations |> Ok


decodeFlags : D.Decoder Flags
decodeFlags =
    D.field "i18n" <|
        D.map2 Flags
            (D.field "defaultLocale" D.string)
            (D.field "translations" <| D.dict D.value)
