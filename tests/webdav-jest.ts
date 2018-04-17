import { NotFoundError } from "../source/errors";
import NextcloudClient   from "../source/client";
import configuration     from "./configuration";
import * as Stream       from "stream";

describe("Webdav integration", function testWebdavIntegration() {
  const client = new NextcloudClient(configuration);

  describe("exists(path)", () => {
    it("should return true if the given resource exists, false otherwise", async () => {
      const path = randomRootPath();

      expect(await client.exists(path)).toBe(false);

      await client.put(path, "");

      expect(await client.exists(path)).toBe(true);

      await client.remove(path);
    });

    it("should not crash for nested folders", async () => {
      const path = `${randomRootPath()}${randomRootPath()}`;

      expect(await client.exists(path)).toBe(false);
    });
  });

  describe("404s", () => {
    it("should throw 404s when a resource is not found", async () => {
      const path  = randomRootPath();
      const path2 = randomRootPath();

      const nested = `${path}${path2}`;

      const stream = new Stream.Readable();

      try { await client.get(path);                  } catch (error) { expect(error instanceof NotFoundError).toBe(true); }
      try { await client.getFiles(path);             } catch (error) { expect(error instanceof NotFoundError).toBe(true); }
      try { await client.put(nested, "");            } catch (error) { expect(error instanceof NotFoundError).toBe(true); }
      try { await client.rename(path, path2);        } catch (error) { expect(error instanceof NotFoundError).toBe(true); }
      try { await client.getReadStream(path);        } catch (error) { expect(error instanceof NotFoundError).toBe(true); }
      try { await client.getWriteStream(nested);     } catch (error) { expect(error instanceof NotFoundError).toBe(true); }
      try { await client.pipeStream(nested, stream); } catch (error) { expect(error instanceof NotFoundError).toBe(true); }
    });
  });

  describe("put & get", () => {
    it("should allow to save and get files without streaming", async () => {
      const path   = randomRootPath();
      const string = "test";

      expect(await client.exists(path)).toBe(false);

      await client.put(path, string);

      expect((await client.get(path)).toString()).toBe(string);

      await client.remove(path);
    });
  });

  describe("remove(path)", () => {
    it("should remove simple files properly", async () => {
      const path = randomRootPath();

      expect(await client.exists(path)).toBe(false);

      await client.put(path, "");

      expect(await client.exists(path)).toBe(true);

      await client.remove(path);

      expect(await client.exists(path)).toBe(false);
    });

    it("should remove folders recursively", async () => {
      const path = randomRootPath();

      const file = `${path}${path}`;

      await client.touchFolder(path);

      expect(await client.exists(path)).toBe(true);

      await client.put(file, "");

      await client.remove(path);

      expect(await client.exists(file)).toBe(false);
      expect(await client.exists(path)).toBe(false);
    });
  });

  describe("touchFolder(path)", () => {
    it("should create folders", async () => {
      const path = randomRootPath();

      expect(await client.exists(path)).toBe(false);

      await client.touchFolder(path);

      expect(await client.exists(path)).toBe(true);

      await client.remove(path);
    });

    it("should allow folders with spaces in their names", async () => {
      const path = `${randomRootPath()} test`;

      await client.touchFolder(path);

      expect(await client.exists(path)).toBe(true);

      await client.remove(path);
    });

    it("should not complain if the folder already exists", async () => {
      const path = `${randomRootPath()} test`;

      await client.touchFolder(path);
      await client.touchFolder(path);

      expect(await client.exists(path)).toBe(true);

      await client.remove(path);
    });

    it("should allow folders with accented characters", async () => {
      const path = `${randomRootPath()} testé`;

      await client.touchFolder(path);

      expect(await client.exists(path)).toBe(true);

      await client.remove(path);
    });
  });

  describe("getFiles(path)", async () => {
    const path = randomRootPath();

    const fileName1 = "file1";
    const fileName2 = "file2";

    const file1 = `${path}/${fileName1}`;
    const file2 = `${path}/${fileName2}`;

    await client.touchFolder(path);
    await client.put(file1, "");
    await client.put(file2, "");

    expect(await client.exists(path)).toBe(true);
    expect(await client.exists(file1)).toBe(true);
    expect(await client.exists(file2)).toBe(true);

    const files = await client.getFiles(path);

    expect(files.length).toBe(2);
    expect(files.includes(fileName1)).toBe(true);
    expect(files.includes(fileName2)).toBe(true);

    await client.remove(path);
  });

  describe("createFolderHierarchy(path)", () => {
    it("should create hierarchies properly, even when part of it already exists", async () => {
      const path = randomRootPath();

      const subFolder1 = "sub1";
      const subFolder2 = "sub2";
      const subFolder3 = "sub3";

      await client.touchFolder(path);

      const subFolder1Path = `${path}/${subFolder1}`;

      const subFolder2Path = `${subFolder1Path}/${subFolder2}`;

      const subFolder3Path = `${subFolder2Path}/${subFolder3}`;

      await client.createFolderHierarchy(subFolder3Path);

      expect(await client.exists(path)).toBe(true);
      expect(await client.exists(subFolder1Path)).toBe(true);
      expect(await client.exists(subFolder2Path)).toBe(true);
      expect(await client.exists(subFolder3Path)).toBe(true);

      await client.remove(path);
    });
  });

  describe("rename(path, newName)", async () => {
    it("should work on simple files", async () => {
      const source  = randomRootPath();
      const renamed = randomRootPath().slice(1);

      const renamedPath = `/${renamed}`;

      await client.put(source, "");

      expect(await client.exists(source)).toBe(true);

      await client.rename(source, renamed);

      expect(await client.exists(source)).toBe(false);
      expect(await client.exists(renamedPath)).toBe(true);

      await client.remove(renamedPath);
    });

    it("should work on folders too", async () => {
      const source  = randomRootPath();
      const renamed = randomRootPath().slice(1);

      const renamedPath = `/${renamed}`;

      await client.touchFolder(source);

      expect(await client.exists(source)).toBe(true);

      await client.rename(source, renamed);

      expect(await client.exists(source)).toBe(false);
      expect(await client.exists(renamedPath)).toBe(true);

      await client.remove(renamedPath);
    });
  });

  describe("getReadStream(path)", () => {
    it("should be able to stream files off of Nextcloud instances", async () => {
      const string = "test";
      const path   = randomRootPath();

      let data = "";

      await client.put(path, string);

      const stream = await client.getReadStream(path);

      stream.on("data", chunk => data += chunk.toString());

      await new Promise((resolve, reject) => {
        stream.on("end", resolve);
        stream.on("error", reject);
      });

      expect(data).toBe(string);

      await client.remove(path);
    });
  });

  describe("getWriteStream(path)", () => {
    it("should pipe readable streams to the Nextcloud instance", async () => {
      const string = "test";
      const path   = randomRootPath();

      const stream = await client.getWriteStream(path);

      expect(stream instanceof Stream).toBe(true);

      await new Promise((resolve, reject) => {
        stream.on("end", resolve);
        stream.on("error", reject);

        stream.write(string);
        stream.end();
      });

      expect(await client.get(path)).toBe(string);

      await client.remove(path);
    });
  });

  describe("pipeStream(path, stream)", () => {
    it("should pipe readable streams to the Nextcloud instance", async () => {
      const string = "test";
      const path   = randomRootPath();

      let stream = new Stream.Readable();

      // See https://stackoverflow.com/questions/12755997/how-to-create-streams-from-string-in-node-js
      stream._read = () => {};

      stream.push(string);
      stream.push(null);

      await client.pipeStream(path, stream);

      expect(await client.get(path)).toBe(string);

      await client.remove(path);
    });
  });
});

function randomRootPath() {
  return `/${Math.floor(Math.random() * 1000000000)}`;
}
