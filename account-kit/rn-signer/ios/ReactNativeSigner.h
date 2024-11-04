
#ifdef RCT_NEW_ARCH_ENABLED
#import "RNReactNativeSignerSpec.h"

@interface ReactNativeSigner : NSObject <NativeReactNativeSignerSpec>
#else
#import <React/RCTBridgeModule.h>

@interface ReactNativeSigner : NSObject <RCTBridgeModule>
#endif

@end
