import { useEffect, useRef } from "react";

const AdComponent = ({ adSlot }) => {
  const adRef = useRef(null);

  useEffect(() => {
    const adElem = adRef.current;
    if (!adElem) return;

    // Don't try to load the ad again if it was already initialized
    if (adElem.getAttribute("data-adsbygoogle-status") === "done") return;

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
      data-ad-slot={adSlot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    ></ins>
  );
};

export default AdComponent;
