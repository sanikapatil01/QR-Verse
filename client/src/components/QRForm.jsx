function QRForm({ text, setText, generateQR }) {

  return (

    <div className="flex flex-col gap-4">

      <input
        type="text"
        placeholder="Enter text or URL"
        className="border p-3 rounded"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <button
        onClick={generateQR}
        className="bg-black text-white p-3 rounded"
      >
        Generate QR
      </button>

    </div>

  );
}

export default QRForm;