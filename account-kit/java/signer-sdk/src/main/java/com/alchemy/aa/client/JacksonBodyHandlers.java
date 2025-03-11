package com.alchemy.aa.client;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.net.http.HttpResponse;
import java.util.function.Function;

public class JacksonBodyHandlers {

  private final ObjectMapper objectMapper;

  public JacksonBodyHandlers(ObjectMapper objectMapper) {
    this.objectMapper = objectMapper;
  }

  public HttpResponse.BodyHandler<JsonNode> jsonNodeHandler() {
    return responseInfo -> subscriberFrom(objectMapper::readTree);
  }

  public <T> HttpResponse.BodyHandler<T> handlerFor(TypeReference<T> typeReference) {
    return responseInfo -> subscriberFrom((bytes) -> objectMapper.readValue(bytes, typeReference));
  }

  public <T> HttpResponse.BodyHandler<T> handlerFor(Class<T> clazz) {
    return responseInfo -> subscriberFrom((bytes) -> objectMapper.readValue(bytes, clazz));
  }

  private <T> HttpResponse.BodySubscriber<T> subscriberFrom(IOFunction<byte[], T> ioFunction) {
    return HttpResponse.BodySubscribers.mapping(HttpResponse.BodySubscribers.ofByteArray(),
        rethrowRuntime(ioFunction));
  }

  @FunctionalInterface
  interface IOFunction<V, T> {

    T apply(V value) throws IOException;
  }

  private static <V, T> Function<V, T> rethrowRuntime(IOFunction<V, T> ioFunction) {
    return (V v) -> {
      try {
        return ioFunction.apply(v);
      } catch (IOException e) {
        throw new UncheckedIOException(e);
      }
    };
  }
}
