port module Ports exposing (exerciseReq, exerciseRes)

import Json.Encode as E


port exerciseReq : E.Value -> Cmd msg


port exerciseRes : (E.Value -> msg) -> Sub msg
