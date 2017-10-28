import PetstoreYaml from "./petstore"
const CONTENT_KEY = "swagger-editor-content"
const BACKEND_URL_KEY = "swagger-backend-url"

let localStorage = window.localStorage

export const updateSpec = (ori) => (...args) => {
  let [spec] = args
  ori(...args)
  saveContentToStorage(spec)
}

export default function(system) {
  // setTimeout runs on the next tick
  setTimeout(() => {
    var backendUrl = localStorage.getItem(BACKEND_URL_KEY)
    if (backendUrl != null) {
      var xhr = new XMLHttpRequest()
      xhr.open('GET', backendUrl, false)
      xhr.send()
      if (xhr.status != 200) {
        console.log(xhr.status + ': ' + xhr.statusText)
      }
      else {
        system.specActions.updateSpec(xhr.responseText)
      }
    }
    else {
      if(localStorage.getItem(CONTENT_KEY)) {
        system.specActions.updateSpec(localStorage.getItem(CONTENT_KEY))
      } else if(localStorage.getItem("ngStorage-SwaggerEditorCache")) {
        // Legacy migration for swagger-editor 2.x
        try {
          let obj = JSON.parse(localStorage.getItem("ngStorage-SwaggerEditorCache"))
          let yaml = obj.yaml
          system.specActions.updateSpec(yaml)
          saveContentToStorage(yaml)
          localStorage.setItem("ngStorage-SwaggerEditorCache", null)
        } catch(e) {
          system.specActions.updateSpec(PetstoreYaml)
        }
      } else {
        system.specActions.updateSpec(PetstoreYaml)
      }
    }
  }, 0)
  return {
    statePlugins: {
      spec: {
        wrapActions: {
          updateSpec
        }
      }
    }
  }
}

function saveContentToStorage(str) {
  var backendUrl = localStorage.getItem(BACKEND_URL_KEY)
  if (backendUrl != null) {
    var xhr = new XMLHttpRequest()
    xhr.open('PUT', backendUrl, true)
    xhr.send(str)

    if (xhr.status != 200) {
      console.log(xhr.status + ': ' + xhr.statusText)
    }
    return str
  }
  else {
    return localStorage.setItem(CONTENT_KEY, str)
  }
}
