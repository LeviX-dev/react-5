import { useEffect, useState } from "react";
import { getNavigations, staticNavigations } from "app/navigations";

export default function useNavigations() {
  const [menu, setMenu] = useState(staticNavigations);

  useEffect(() => {
    let isMounted = true;

    const loadNavigations = async () => {
      const data = await getNavigations();
      if (isMounted) setMenu(data);
    };

    loadNavigations();

    return () => {
      isMounted = false;
    };
  }, []);

  return menu;
}
