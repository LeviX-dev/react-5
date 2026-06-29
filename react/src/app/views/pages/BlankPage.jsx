import Breadcrumb from "app/components/Breadcrumb";

export default function BlankPage() {
  return (
    <section>
      <Breadcrumb
        routeSegments={[
          { name: "Home", path: "/" },
          { name: "Pages", path: "/pages" },
          { name: "Blank Page" }
        ]}
      />
    </section>
  );
}
