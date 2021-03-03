port module Ports exposing (..)

import Json.Encode as E


port exerciseReq : E.Value -> Cmd msg


port exerciseRes : (E.Value -> msg) -> Sub msg


port settingsPush : E.Value -> Cmd msg


port settingsPull : (E.Value -> msg) -> Sub msg
