package com.accountkit.reactnativesigner

import com.accountkit.reactnativesigner.core.TEKStamper
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.annotations.ReactModule

@ReactModule(name = NativeTEKStamperModule.NAME)
class NativeTEKStamperModule(reactContext: ReactApplicationContext) :
    NativeTEKStamperSpec(reactContext) {

    private val stamper = TEKStamper(reactContext.applicationContext)

    override fun getName(): String {
        return NAME
    }

    override fun init(promise: Promise) {
        try {
            val tekPublicKey = stamper.init()

            return promise.resolve(tekPublicKey)
        } catch (e: Exception) {
            promise.reject(e)
        }
    }

    override fun clear() {
        stamper.clear()
    }

    override fun publicKey(): String? {
        return stamper.publicKey()
    }

    override fun injectCredentialBundle(bundle: String, promise: Promise) {
        try {
            stamper.injectCredentialBundle(bundle)

            return promise.resolve(true)
        } catch (e: Exception) {
            promise.reject(e)
        }
    }

    override fun stamp(payload: String, promise: Promise) {
        try {
            val stamp = stamper.stamp(payload)

            val response = Arguments.createMap()
            response.putString("stampHeaderName", stamp.stampHeaderName)
            response.putString(
                "stampHeaderValue",
                stamp.stampHeaderValue
            )
            return promise.resolve(stamp)
        } catch (e: Exception) {
            promise.reject(e)
        }
    }

    companion object {
        const val NAME = "NativeTEKStamper"
    }
}
