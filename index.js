/**
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Blob
 * @see https://web.dev/blog/compressionstreams
 */

const getCompressedChunks = async () => {
    const res = await fetch('https://jsonplaceholder.typicode.com/users')

    const readableStream = res.body;
    const compressionReadbleStream = readableStream.pipeThrough(new CompressionStream("gzip"))

    let done = false;

    const reader = compressionReadbleStream.getReader()

    const chunks = [];
    let totalLength = 0

    while(!done) {
        const { done: doneReading, value } = await reader.read();
        if(!value) break;

        chunks.push(value);
        totalLength += (value?.length || 0);
        done = doneReading
    }

    return { chunks, totalLength };
}

const convertToTypedArray = (chunks, totalLength) => {
    const typedArray = new Uint8Array(totalLength);
    let offset = 0;

    for(const chunk of chunks) {
        typedArray.set(chunk, offset)
        offset += chunk.length;
    }

    return typedArray;
}

const convertToBlobURL = (typedArray) => {
    const blob = new Blob([typedArray.buffer], { type:"text/plain" })

    return URL.createObjectURL(blob)
}

const createLink = async () => {
    const {chunks,totalLength} = await getCompressedChunks();
    console.log(chunks, totalLength);
    const typedArray = convertToTypedArray(chunks,totalLength);
    console.log(typedArray);
    const blobUrl=convertToBlobURL(typedArray);
    console.log(blobUrl);

    const a = document.createElement('a');
    a.download = 'compressed-file.gzip'
    a.innerText = 'download compressed file';
    a.id = 'compress stream';
    a.href = blobUrl;

    return a
}

const a = await createLink();
document.body.append(a)

const writeToDocument = async (value) => {
    document.open()
    document.write(await value);
    document.close()
}






























