const express = require("express");
const cors = require("cors");
const Zetabase = require("zetabasejs");
const { graphql, buildSchema } = require("graphql");

const DATA = require("./YoutubeSearchResult.json");
const app = express()
app.use(cors())
const db = new Zetabase("database.json")

//Setup data
db.wipe("/")
if (!db.containsKey("/Youtube"))
    for (let i in DATA) db.append("/Youtube", DATA[i])

//Setup graphql
const Schema = buildSchema(`
    type Video {
        kind: String,
        etag: String
        id: VideoID
        snippet: Detail
    },
    type VideoID {
        kind: String,
        videoId: String
    },
    type Detail {
        publishedAt: String,
        channelId: String,
        title: String,
        description: String,
        thumbnails: Thumbnail,
        channelTitle: String,
        liveBroadcastContent: String
    },
    type Thumbnail {
        default: Image,
        medium: Image,
        high: Image
    },
    type Image {
        url: String,
        width: Float,
        height: Float
    },
    type Query {
        video: [ Video ]
    }
`)

const root = {
    video: () => {
        let list = Object.values(db.query('/Youtube/:key/@{}', true))
        return list
    }
}

const query = `
{
    video {
        id {
            videoId
        }
        snippet {
            title
            description
            thumbnails {
                high {
                    url
                }
            }
        }
    }
}
`

app.use(cors())
app.get("/", (q, r) => r.json(db.memory))
app.get('/graphql', (q, r) => {
    graphql(Schema, query, root).then(res => r.json(res))
})
app.listen(5000, _ => console.log("Server listens on port 5000"))