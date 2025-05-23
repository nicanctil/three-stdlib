const VRButton = /* @__PURE__ */ (() => {
  class VRButton {
    static createButton(renderer, sessionInit = {}) {
      const button = document.createElement('button')

      function showEnterVR(/*device*/) {
        let currentSession = null

        async function onSessionStarted(session) {
          session.addEventListener('end', onSessionEnded)

          await renderer.xr.setSession(session)
          button.textContent = 'EXIT VR'

          currentSession = session
        }

        function onSessionEnded(/*event*/) {
          currentSession.removeEventListener('end', onSessionEnded)

          button.textContent = 'ENTER VR'

          currentSession = null
        }

        //

        button.style.display = ''

        button.style.cursor = 'pointer'
        button.style.left = 'calc(50% - 50px)'
        button.style.width = '100px'

        button.textContent = 'ENTER VR'

        button.onmouseenter = () => {
          button.style.opacity = '1.0'
        }

        button.onmouseleave = () => {
          button.style.opacity = '0.5'
        }

        button.onclick = () => {
          if (currentSession === null) {
            // WebXR's requestReferenceSpace only works if the corresponding feature
            // was requested at session creation time. For simplicity, just ask for
            // the interesting ones as optional features, but be aware that the
            // requestReferenceSpace call will fail if it turns out to be unavailable.
            // ('local' is always available for immersive sessions and doesn't need to
            // be requested separately.)

            const optionalFeatures = [sessionInit.optionalFeatures, 'local-floor', 'bounded-floor', 'hand-tracking']
              .flat()
              .filter(Boolean)

            navigator.xr?.requestSession('immersive-vr', { ...sessionInit, optionalFeatures }).then(onSessionStarted)
          } else {
            currentSession.end()
          }
        }
      }

      function disableButton() {
        button.style.display = ''

        button.style.cursor = 'auto'
        button.style.left = 'calc(50% - 75px)'
        button.style.width = '150px'

        button.onmouseenter = null
        button.onmouseleave = null

        button.onclick = null
      }

      function showWebXRNotFound() {
        disableButton()

        button.textContent = 'VR NOT SUPPORTED'
      }

      function stylizeElement(element) {
        element.style.position = 'absolute'
        element.style.bottom = '20px'
        element.style.padding = '12px 6px'
        element.style.border = '1px solid #fff'
        element.style.borderRadius = '4px'
        element.style.background = 'rgba(0,0,0,0.1)'
        element.style.color = '#fff'
        element.style.font = 'normal 13px sans-serif'
        element.style.textAlign = 'center'
        element.style.opacity = '0.5'
        element.style.outline = 'none'
        element.style.zIndex = '999'
      }

      if ('xr' in navigator) {
        stylizeElement(button)
        button.id = 'VRButton'
        button.style.display = 'none'

        // Query for session mode
        navigator.xr.isSessionSupported('immersive-vr').then((supported) => {
          supported ? showEnterVR() : showWebXRNotFound()

          if (supported && VRButton.xrSessionIsGranted) {
            button.click()
          }
        })

        return button
      } else {
        const message = document.createElement('a')

        if (window.isSecureContext === false) {
          message.href = document.location.href.replace(/^http:/, 'https:')
          message.innerHTML = 'WEBXR NEEDS HTTPS' // TODO Improve message
        } else {
          message.href = 'https://immersiveweb.dev/'
          message.innerHTML = 'WEBXR NOT AVAILABLE'
        }

        message.style.left = 'calc(50% - 90px)'
        message.style.width = '180px'
        message.style.textDecoration = 'none'

        stylizeElement(message)

        return message
      }
    }

    static xrSessionIsGranted = false

    static registerSessionGrantedListener() {
      if (typeof navigator !== 'undefined' && 'xr' in navigator) {
        navigator.xr.addEventListener('sessiongranted', () => {
          VRButton.xrSessionIsGranted = true
        })
      }
    }
  }

  VRButton.registerSessionGrantedListener()

  return VRButton
})()

export { VRButton }
