#ifdef RCT_NEW_ARCH_ENABLED
#import "NativeTEKStamper.h"
#if __has_include("account_kit_react_native_signer/account_kit_react_native_signer-Swift.h")
#import "account_kit_react_native_signer/account_kit_react_native_signer-Swift.h"
#else
#import "account_kit_react_native_signer-Swift.h"
#endif


@implementation NativeTEKStamper
RCT_EXPORT_MODULE()

- (void)clear {
    
}

- (void)init:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
    NSLog(@"Hello");
}

- (void)injectCredentialBundle:(NSString *)bundle resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
    
}

- (NSString * _Nullable)publicKey {
    return nullptr;
}

- (void)stamp:(NSString *)payload resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
    
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeTEKStamperSpecJSI>(params);
}

@end
#endif // RCT_NEW_ARCH_ENABLED
