package com.careplatform.common.exception;

public class CarePlatformException extends RuntimeException {
    public CarePlatformException(String message) {
        super(message);
    }

    public CarePlatformException(String message, Throwable cause) {
        super(message, cause);
    }
}
