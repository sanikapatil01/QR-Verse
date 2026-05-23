function QRPreview({ qrImage }) {

  return (

    <div className="mt-5">

      <img
        src={qrImage}
        alt="QR"
      />

      <a
        href={qrImage}
        download="qr.png"
        className="block bg-green-500 text-white mt-3 p-2 rounded text-center"
      >
        Download
      </a>

    </div>

  );
}

export default QRPreview;