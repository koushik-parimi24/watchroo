import { useEffect, useRef } from "react";

const AdComponent = () => {
  const adRef = useRef(null);

  useEffect(() => {
    if (!adRef.current) return;

    // Check if ad has already been rendered
    if (adRef.current.getAttribute("data-adsbygoogle-status") === "done") {
      return;
    }

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error("Adsense error", e);
    }
  }, []);

  return (
    <ins
      ref={adRef}
      className="adsbygoogle"
      style={{ display: "block" }}
      data-ad-client="ca-pub-3940256099942544"
      data-ad-slot="1234567890"
      data-ad-format="auto"
      data-full-width-responsive="true"
    ></ins>
  );
};

export default AdComponent;
