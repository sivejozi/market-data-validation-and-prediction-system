package com.sive.validation.prediction.system.dto.message;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MessageDTO {
    private String key;
    private String source;
    private String target;
    private LocalDateTime timestamp;
    private String id;
    private String description;
    private DataDTO data;
    
    @Override
    public String toString() {
        return "Message{" +
                "key='" + key + '\'' +
                ", source='" + source + '\'' +
                ", target='" + target + '\'' +
                ", timestamp=" + timestamp +
                ", id='" + id + '\'' +
                ", description='" + description + '\'' +
                ", data=" + data +
                '}';
    }
}
