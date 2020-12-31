module Exercise exposing
    ( Builder
    , Distortion
    , DistortionId
    , Exercise
    , Id
    , Request(..)
    , Response(..)
    , decode
    , distortions
    , empty
    , encode
    , icons
    , request
    , response
    )

import Json.Decode as D
import Json.Encode as E
import Ports
import Set exposing (Set)
import Time exposing (Posix)


type alias Id =
    String


type alias DistortionId =
    String


type alias Exercise =
    { id : Id
    , created : Posix
    , updated : Posix
    , problem : String
    , distortions : Set DistortionId
    , challenge : String
    , alternative : String
    }


type alias Builder =
    { problem : String
    , distortions : Set DistortionId
    , challenge : String
    , alternative : String
    }


type alias Form a =
    { a
        | problem : String
        , distortions : Set DistortionId
        , challenge : String
        , alternative : String
    }


type alias Distortion =
    { id : DistortionId, icon : String }


distortions : List Distortion
distortions =
    [ Distortion "all_or_nothing_thinking" "🌓"
    , Distortion "catastrophizing" "\u{1F92F}"
    , Distortion "emotional_reasoning" "🎭"
    , Distortion "fortune_telling" "🔮"
    , Distortion "labeling" "🏷"
    , Distortion "magnification_of_the_negative" "👎"
    , Distortion "mind_reading" "\u{1F9E0}"
    , Distortion "minimization_of_the_positive" "👍"
    , Distortion "other_blaming" "\u{1F9DB}"
    , Distortion "over_generalization" "👯"
    , Distortion "self_blaming" "👁"
    , Distortion "should_statements" "✨"
    ]


empty : Builder
empty =
    { problem = ""
    , distortions = Set.empty
    , challenge = ""
    , alternative = ""
    }


icons : Form a -> List String
icons ex =
    distortions
        |> List.filter (\dis -> Set.member dis.id ex.distortions)
        |> List.map .icon



---- JSON ----


encode : Exercise -> E.Value
encode ex =
    E.object
        [ ( "id", ex.id |> E.string )
        , ( "created", ex.created |> Time.posixToMillis |> E.int )
        , ( "updated", ex.updated |> Time.posixToMillis |> E.int )
        , ( "problem", ex.problem |> E.string )
        , ( "distortions", ex.distortions |> Set.toList |> E.list E.string )
        , ( "challenge", ex.challenge |> E.string )
        , ( "alternative", ex.alternative |> E.string )
        ]


encodeBuilder : Builder -> E.Value
encodeBuilder ex =
    E.object
        [ ( "problem", ex.problem |> E.string )
        , ( "distortions", ex.distortions |> Set.toList |> E.list E.string )
        , ( "challenge", ex.challenge |> E.string )
        , ( "alternative", ex.alternative |> E.string )
        ]


decode : D.Decoder Exercise
decode =
    D.map7 Exercise
        (D.field "id" D.string)
        (D.field "created" <| D.map Time.millisToPosix D.int)
        (D.field "updated" <| D.map Time.millisToPosix D.int)
        (D.field "problem" D.string)
        (D.field "distortions" <| D.map Set.fromList <| D.list D.string)
        (D.field "challenge" D.string)
        (D.field "alternative" D.string)



---- PORTS ----


type Request
    = PostReq Builder
    | PutReq Exercise
    | DeleteReq String
    | GetReq String
    | ListReq


encodeReq : Request -> E.Value
encodeReq req =
    case req of
        PostReq b ->
            encodeBuilder b |> encodeReq_ "post"

        PutReq e ->
            encode e |> encodeReq_ "put"

        DeleteReq id ->
            E.string id |> encodeReq_ "delete"

        GetReq id ->
            E.string id |> encodeReq_ "get"

        ListReq ->
            E.null |> encodeReq_ "list"


encodeReq_ : String -> E.Value -> E.Value
encodeReq_ method data =
    E.object
        [ ( "method", method |> E.string )
        , ( "data", data )
        ]


request : Request -> Cmd msg
request =
    encodeReq >> Ports.exerciseReq


type Response
    = PostRes Exercise
    | PutRes Exercise
    | DeleteRes Id
    | GetRes (Maybe Exercise)
    | ListRes (List Exercise)


decodeRes : D.Decoder Response
decodeRes =
    D.andThen
        (\method ->
            case method of
                "post" ->
                    decode |> D.field "data" |> D.map PostRes

                "put" ->
                    decode |> D.field "data" |> D.map PutRes

                "delete" ->
                    D.string |> D.field "data" |> D.map DeleteRes

                "get" ->
                    decode
                        |> D.nullable
                        |> D.field "data"
                        |> D.map GetRes

                "list" ->
                    D.list decode |> D.field "data" |> D.map ListRes

                _ ->
                    D.fail <| "unknown response method: " ++ method
        )
        (D.field "method" D.string)


response : (Result String Response -> msg) -> Sub msg
response toMsg =
    Ports.exerciseRes (D.decodeValue decodeRes >> Result.mapError D.errorToString >> toMsg)
