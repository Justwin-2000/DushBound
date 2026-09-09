package game.duskbound.embers;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;

/** JVM checks for external save-file boundaries; no Android device is implied. */
public final class SaveFileCodecTest {
    private static int checks;

    public static void main(String[] args) throws Exception {
        String sample = "{\"title\":\"暮边镇\",\"dialog\":\"quoted \\\" words\"}";
        equal(sample, SaveFileCodec.read(new ByteArrayInputStream(SaveFileCodec.encode(sample))), "Chinese JSON round trip");
        equal(sample, SaveFileCodec.read(new ByteArrayInputStream(("\ufeff" + sample).getBytes(StandardCharsets.UTF_8))), "UTF-8 BOM accepted");
        rejected(new Operation() { public void run() throws Exception { SaveFileCodec.encode(null); } }, "null export");
        rejected(new Operation() { public void run() throws Exception { SaveFileCodec.encode(""); } }, "empty export");
        rejected(new Operation() { public void run() throws Exception { SaveFileCodec.read(new ByteArrayInputStream(new byte[0])); } }, "empty import");
        rejected(new Operation() { public void run() throws Exception { SaveFileCodec.read(new ByteArrayInputStream(new byte[] {(byte)0xc3, (byte)0x28})); } }, "invalid UTF-8 rejected");
        byte[] bytes = new byte[SaveFileCodec.MAX_BYTES];
        Arrays.fill(bytes, (byte)'a');
        String boundary = SaveFileCodec.read(new ByteArrayInputStream(bytes));
        equal(SaveFileCodec.MAX_BYTES, boundary.length(), "exact 1 MiB import accepted");
        equal(SaveFileCodec.MAX_BYTES, SaveFileCodec.encode(boundary).length, "exact 1 MiB export accepted");
        rejected(new Operation() { public void run() throws Exception { SaveFileCodec.read(new ByteArrayInputStream(new byte[SaveFileCodec.MAX_BYTES + 1])); } }, "oversize import rejected");
        rejected(new Operation() { public void run() throws Exception { SaveFileCodec.encode(boundary + "a"); } }, "oversize export rejected");
        final char[] chinese = new char[SaveFileCodec.MAX_BYTES / 3 + 1];
        Arrays.fill(chinese, '灯');
        rejected(new Operation() { public void run() throws Exception { SaveFileCodec.encode(new String(chinese)); } }, "UTF-8 byte limit, not character count");
        equal("not a save", SaveFileCodec.read(new ByteArrayInputStream("not a save".getBytes(StandardCharsets.UTF_8))), "schema validation remains with game store");
        System.out.println("PASS: " + checks + " native save-file transport checks");
    }

    private static void equal(Object expected, Object actual, String name) {
        if (!expected.equals(actual)) throw new AssertionError(name);
        ++checks;
    }

    private static void rejected(Operation operation, String name) throws Exception {
        try { operation.run(); } catch (IOException expected) { ++checks; return; }
        throw new AssertionError(name);
    }

    private interface Operation { void run() throws Exception; }
}
