import React, {useState, useEffect, useRef} from 'react'
import {toast} from 'react-toastify'
import {register} from './index'
 
class UpdateToast extends React.Component {
    render() {
        return (
            <div className="flex left column dc__app-update-toast">
                <span className="info">{this.props.text}</span>
                <button type="button" onClick={this.props.onClick}>
                    {this.props.buttonText}
                </button>
            </div>
        )
    }
}

export default function ServiceWorker() {
    const [forceUpdateOnLocationChange, setForceUpdateOnLocationChange] = useState(false)
    const refreshing = useRef(false)
    const updateToastRef = useRef(null)
    const [bgUpdated, setBGUpdated] = useState(false)
async function update() {
    console.log('update')
    if (!navigator.serviceWorker) return
    try {
        const reg = await navigator.serviceWorker.getRegistration()
        console.log(reg)
        if (reg.waiting) {
            console.log('skipWaiting')
            reg.waiting.postMessage({ type: 'SKIP_WAITING' })
        }
    } catch (err) {}
}

function handleControllerChange() {
    if (refreshing.current) {
        return
    }
    if (document.visibilityState === 'visible') {
        window.location.reload()
        refreshing.current = true
    } else {
        setBGUpdated(true)
    }
}

useEffect(() => {
    if (!forceUpdateOnLocationChange) return
    update()
}, [window.location])

useEffect(() => {
    if (!navigator.serviceWorker) return
    function onUpdate(reg) {
        const updateToastBody = (
            <UpdateToast
                onClick={update}
                text="You are viewing an outdated version."
                buttonText="Reload"
            />
        )
        if (toast.isActive(updateToastRef.current)) {
            toast.update(updateToastRef.current, { render: updateToastBody })
        } else {
            updateToastRef.current = toast.info(updateToastBody, { autoClose: false, closeButton: false })
        }
        setForceUpdateOnLocationChange(true)
        if (typeof Storage !== 'undefined') {
            localStorage.removeItem('serverInfo')
        }
    }
    function onSuccess(reg) {
        console.log('successfully installed')
    }
    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange)
    register({ onUpdate, onSuccess })
    navigator.serviceWorker.getRegistration().then((reg) => {
        if (!reg) return
        setInterval(
            (reg) => {
                try {
                    reg.update()
                } catch (err) {}
            },
            1000 * 60,
            reg,
        )
        if (reg.waiting) {
            onUpdate(reg)
        } else {
            try {
                reg.update()
            } catch (err) {}
        }
    })
}, [])

useEffect(() => {
    if (!bgUpdated) return
    const bgUpdatedToastBody = (
        <UpdateToast
            onClick={(e) => window.location.reload()}
            text="This page has been updated. Please save any unsaved changes and refresh."
            buttonText="Reload"
        />
    )
    if (toast.isActive(updateToastRef.current)) {
        toast.update(updateToastRef.current, { render: bgUpdatedToastBody })
    } else {
        updateToastRef.current = toast.info(bgUpdatedToastBody, { autoClose: false, closeButton: false })
    }
}, [bgUpdated])
return null
}