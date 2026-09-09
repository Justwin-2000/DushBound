package game.duskbound.embers;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.ByteBuffer;
import java.nio.charset.CharacterCodingException;
import java.nio.charset.CodingErrorAction;
import java.nio.charset.StandardCharsets;

/** Transport limits only. Save schema and game rules are validated by the game store. */
final class SaveFileCodec {
    static final int MAX_BYTES = 1024 * 1024;

    static byte[] encode(String content) throws IOException {
        if (content == null || content.isEmpty()) throw new IOException("存档内容为空");
        if (content.length() > MAX_BYTES) throw new IOException("存档文件不能超过 1 MB");
        byte[] bytes = content.getBytes(StandardCharsets.UTF_8);
        if (bytes.length > MAX_BYTES) throw new IOException("存档文件不能超过 1 MB");
        return bytes;
    }

    static String read(InputStream input) throws IOException {
        if (input == null) throw new IOException("无法读取这个文件");
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        byte[] buffer = new byte[8192];
        int count;
        while ((count = input.read(buffer)) != -1) {
            if (output.size() + count > MAX_BYTES) throw new IOException("存档文件不能超过 1 MB");
            output.write(buffer, 0, count);
        }
        if (output.size() == 0) throw new IOException("存档文件为空");
        try {
            String content = StandardCharsets.UTF_8.newDecoder()
                .onMalformedInput(CodingErrorAction.REPORT)
                .onUnmappableCharacter(CodingErrorAction.REPORT)
                .decode(ByteBuffer.wrap(output.toByteArray())).toString();
            return content.startsWith("\ufeff") ? content.substring(1) : content;
        } catch (CharacterCodingException exception) {
            throw new IOException("存档文件必须使用 UTF-8 编码", exception);
        }
    }

    private SaveFileCodec() { }
}
