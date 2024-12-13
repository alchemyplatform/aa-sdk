import Foundation

extension String {
  public var hex: some Sequence<UInt8> {
    self[...].hex
  }

  public var hexData: Data {
    return Data(hex)
  }
}

extension Substring {
  public var hex: some Sequence<UInt8> {
    sequence(
      state: self,
      next: { remainder in
        guard remainder.count > 2 else { return nil }
        let nextTwo = remainder.prefix(2)
        remainder.removeFirst(2)
        return UInt8(nextTwo, radix: 16)
      })
  }
}
