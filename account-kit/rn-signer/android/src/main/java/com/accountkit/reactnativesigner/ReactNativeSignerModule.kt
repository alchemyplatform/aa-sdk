package com.accountkit.reactnativesigner

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.annotations.ReactModule

@ReactModule(name = ReactNativeSignerModule.NAME)
class ReactNativeSignerModule(reactContext: ReactApplicationContext) :
        NativeTEKStamperSpec(reactContext) {

  override fun getName(): String {
    return NAME
  }

  override fun init(promise: Promise?) {
    TODO("Not yet implemented")
  }

  override fun clear() {
    TODO("Not yet implemented")
  }

  override fun publicKey(): String? {
    TODO("Not yet implemented")
  }

  override fun injectCredentialBundle(bundle: String?, promise: Promise?) {
    TODO("Not yet implemented")
  }

  override fun stamp(payload: String?, promise: Promise?) {
    TODO("Not yet implemented")
  }

  companion object {
    const val NAME = "ReactNativeSigner"
  }
}
