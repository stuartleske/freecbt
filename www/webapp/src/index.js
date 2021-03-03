import './main.css';
import { Elm } from './Main.elm';
import * as serviceWorker from './serviceWorker';
import localforage from 'localforage';
import './i18n-element'
import i18n from './i18n-load'

async function main() {
  const store = {
    exercises: await localforage.createInstance({
      name: "freecbt",
      storeName: "exercises",
    }),
    settings: await localforage.createInstance({
      name: "freecbt",
      storeName: "settings",
    }),
  }
  // await store.exercises.dropInstance()
  // await store.settings.dropInstance()

  const flags = {i18n}
  const app = Elm.Main.init({flags});
  const exerciseRequests = buildExerciseRequests(store)

  app.ports.exerciseReq.subscribe(async req =>
    app.ports.exerciseRes.send(await (async () => {
      try {
        const fn = exerciseRequests[req.method]
        if (!fn)
          throw new Error('no such exercise method: '+req.method)
        return {method: req.method, data: await fn(req.data)}
      }
      catch (e) {
        return {method: req.method, error: e.message || '' + e}
      }
    })())
  )
  app.ports.settingsPush.subscribe(async data => {
    await store.settings.setItem('settings', data)
    app.ports.settingsPull.send({data})
  })
  app.ports.settingsPull.send({data: await store.settings.getItem('settings')})
}
function buildExerciseRequests(store) {
  const SEQ_KEY = 'seq'
  return {
    post: async data => {
      const seq = (await store.exercises.getItem(SEQ_KEY)) || 0
      const id = '' + seq
      const created = Date.now()
      data = {...data, created, updated: created, id}
      await Promise.all([
        store.exercises.setItem(data.id, data),
        store.exercises.setItem(SEQ_KEY, seq + 1),
      ])
      return data
    },
    put: async data => {
      if (data.id == null) {
        throw new Error("exercise.id is required")
      }
      data = {...data, updated: Date.now()}
      await store.exercises.setItem(data.id, data)
      return data
    },
    delete: async id => {
      if (id == null) {
        throw new Error("id is required")
      }
      await store.exercises.removeItem(id)
      return true
    },
    get: async id => {
      if (id == null) {
        throw new Error("id is required")
      }
      return await store.exercises.getItem(id)
    },
    list: async () => {
      const data = []
      await store.exercises.iterate((val, key) => {
        if (key === SEQ_KEY)
          return
        data.push(val)
      })
      return data
    },
  }
}

main()

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
