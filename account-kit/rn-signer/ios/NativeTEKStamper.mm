#ifdef RCT_NEW_ARCH_ENABLED
#import "NativeTEKStamper.h"
#if __has_include("account_kit_react_native_signer/account_kit_react_native_signer-Swift.h")
#import "account_kit_react_native_signer/account_kit_react_native_signer-Swift.h"
#else
#import "account_kit_react_native_signer-Swift.h"
#endif


@implementation NativeTEKStamper {
    NativeTEKStamperImpl *_stamper;
}
RCT_EXPORT_MODULE()

- (id) init {
    self = [super init];
    if (self) {
        _stamper = [NativeTEKStamperImpl new];
    }
    
    return self;
}

- (void)clear {
    [_stamper clear];
}

- (void)init:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
    [_stamper createWithCompletionHandler:^(NSString * _Nullable result, NSError * _Nullable error) {
        if (error) {
            return reject([NSString stringWithFormat: @"%ld", (long)error.code], error.description, error);
        }
        
        return resolve(result);
    }];
    
}

- (void)injectCredentialBundle:(NSString *)bundle resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
    [_stamper injectCredentialBundleWithBundle:bundle completionHandler:^(BOOL success, NSError * _Nullable error) {
        if (error) {
            return reject([NSString stringWithFormat: @"%ld", (long)error.code], error.description, error);
        }
        
        return resolve(@(success));
    }];
}

- (NSString * _Nullable)publicKey {
    return [_stamper publicKey];
}

- (void)stamp:(NSString *)payload resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
    [_stamper stampWithPayload:payload completionHandler:^(NSDictionary<NSString *,id> * _Nullable result, NSError * _Nullable error) {
        if (error) {
            return reject([NSString stringWithFormat: @"%ld", (long)error.code], error.description, error);
        }
        
        return resolve(result);
    }];
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeTEKStamperSpecJSI>(params);
}

@end
#endif // RCT_NEW_ARCH_ENABLED
