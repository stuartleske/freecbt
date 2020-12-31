module Session exposing (Session, init)

import Browser.Navigation as Nav
import Json.Encode as Json


type alias Session =
    -- Nav.Key cannot be unit tested; Maybe Nav.Key is a workaround.
    -- See https://github.com/elm-explorations/test/issues/24
    { nav : Maybe Nav.Key
    , i18nBundle : Json.Value
    }


init : Maybe Nav.Key -> Json.Value -> Session
init =
    Session
