export default function Home() {
  return (
    <div className="flex min-h-full items-center justify-center bg-background px-6 py-16 font-sans">
      <main className="flex w-full max-w-2xl flex-col gap-8">
        <section className="space-y-4">
          <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">
            Image to bead pattern
          </p>
          <h1 className="text-4xl font-semibold text-zinc-950">PixelBead</h1>
          <p className="max-w-xl text-base leading-7 text-zinc-600">
            Upload a local image to prepare it for bead pattern conversion.
          </p>
        </section>

        <label
          htmlFor="image-upload"
          className="flex cursor-pointer flex-col gap-3 border border-dashed border-zinc-300 bg-white p-6 text-zinc-800 transition hover:border-zinc-500"
        >
          <span className="text-sm font-medium">Upload image</span>
          <input
            id="image-upload"
            name="image-upload"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="text-sm text-zinc-600 file:mr-4 file:border-0 file:bg-zinc-950 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white"
          />
        </label>
      </main>
    </div>
  );
}
