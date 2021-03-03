module Session exposing (Session, init)

import Browser.Navigation as Nav
import Json.Decode as D
import RemoteData exposing (RemoteData)
import Settings exposing (Settings)


type alias Session =
    -- Nav.Key cannot be unit tested; Maybe Nav.Key is a workaround.
    -- See https://github.com/elm-explorations/test/issues/24
    { nav : Maybe Nav.Key
    , settings : RemoteData String Settings
    , translations : List String
    }


type alias Flags =
    { translations : List String }


init : Maybe Nav.Key -> D.Value -> Result String Session
init nav rawflags =
    case D.decodeValue decodeFlags rawflags of
        Err err ->
            err |> D.errorToString |> Err

        Ok flags ->
            Session nav RemoteData.NotAsked flags.translations |> Ok


decodeFlags : D.Decoder Flags
decodeFlags =
    D.field "i18n" <|
        D.map Flags
            (D.field "translations" <| D.list D.string)
