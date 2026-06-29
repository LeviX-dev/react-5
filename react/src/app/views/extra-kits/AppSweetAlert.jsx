import { Button, Row, Col, Card } from "react-bootstrap";
import swal from "sweetalert2";
import Breadcrumb from "app/components/Breadcrumb";

export default function AppSweetAlert() {
  return (
    <div>
      <Breadcrumb
        routeSegments={[
          { name: "Home", path: "/" },
          { name: "Extra Kits", path: "/extra-kits" },
          { name: "Sweet Alert" }
        ]}
      />

      <Row>
        <Col sm={6} xs={12} className="mb-4">
          <Card body className="h-100">
            <Card.Title>Basic Alert</Card.Title>

            <div className="d-flex align-items-center gap-2 flex-wrap">
              <Button onClick={() => swal.fire("Any fool can use a computer?")}>Basic</Button>
              <Button
                onClick={() =>
                  swal.fire({
                    icon: "question",
                    title: "The Internet?",
                    text: "That thing is still around?"
                  })
                }>
                Title with Text
              </Button>
            </div>
          </Card>
        </Col>

        <Col sm={6} xs={12} className="mb-4">
          <Card body className="h-100">
            <Card.Title>Other Options</Card.Title>

            <div className="d-flex align-items-center gap-2 flex-wrap">
              <Button
                onClick={() => {
                  swal
                    .fire({
                      title: "Are you sure?",
                      text: "You won't be able to revert this!",
                      icon: "warning",
                      type: "question",
                      showCancelButton: true,
                      confirmButtonColor: "#3085d6",
                      cancelButtonColor: "#d33",
                      confirmButtonText: "Yes, delete it!",
                      cancelButtonText: "No"
                    })
                    .then((result) => {
                      if (result.value) {
                        swal.fire("Deleted!", "Your file has been deleted.", "success");
                      } else {
                        swal.fire("Cancelled!", "Permission denied.", "error");
                      }
                    });
                }}>
                Confirm Dialog
              </Button>

              <Button
                onClick={() => {
                  swal.fire({
                    title: "Sweet!",
                    text: "Modal with a custom image.",
                    imageUrl: "/assets/images/photo-wide-4.jpg",
                    imageWidth: 400,
                    imageHeight: 200,
                    imageAlt: "Custom image"
                  });
                }}>
                Alert with Image
              </Button>

              <Button
                onClick={() => {
                  let timerInterval;
                  swal
                    .fire({
                      title: "Auto close alert!",
                      html: "I will close in <b></b> milliseconds.",
                      timer: 2000,
                      timerProgressBar: true,
                      onBeforeOpen: () => {
                        swal.showLoading();
                        timerInterval = setInterval(() => {
                          swal.getContent().querySelector("b").textContent = swal.getTimerLeft();
                        }, 100);
                      },
                      onClose: () => {
                        clearInterval(timerInterval);
                      }
                    })
                    .then((result) => {
                      if (result.dismiss === swal.DismissReason.timer) {
                        console.log("I was closed by the timer");
                      }
                    });
                }}>
                Self Closing Alert
              </Button>
            </div>
          </Card>
        </Col>

        <Col lg={6} md={6} sm={6} xs={12} className="mb-4">
          <Card body className="h-100">
            <Card.Title>Icon Types</Card.Title>

            <div className="d-flex align-items-center gap-2 flex-wrap">
              <Button
                variant="success"
                onClick={() => {
                  swal.fire({
                    icon: "success",
                    title: "Good job!",
                    text: "You clicked the button!"
                  });
                }}>
                Success
              </Button>

              <Button
                variant="danger"
                onClick={() => {
                  swal.fire({
                    icon: "error",
                    title: "Oops...",
                    text: "Something went wrong!"
                  });
                }}>
                Error
              </Button>

              <Button
                variant="warning"
                onClick={() => {
                  swal.fire({
                    icon: "warning",
                    title: "Are you sure?",
                    text: "You won't be able to revert this!"
                  });
                }}>
                Warning
              </Button>

              <Button
                variant="info"
                onClick={() => {
                  swal.fire({
                    icon: "info",
                    title: "Info!",
                    text: "You clicked the button!"
                  });
                }}>
                Info
              </Button>

              <Button
                onClick={() => {
                  swal.fire({
                    icon: "question",
                    title: "Are you sure?",
                    text: "You won't be able to revert this!"
                  });
                }}>
                Question
              </Button>
            </div>
          </Card>
        </Col>

        <Col lg={6} md={6} sm={6} xs={12} className="mb-4">
          <Card body className="h-100">
            <Card.Title>Special Alerts</Card.Title>

            <div className="d-flex align-items-center gap-2 flex-wrap">
              <Button
                onClick={() => {
                  swal
                    .fire({
                      title: "Submit your Github username",
                      input: "text",
                      inputAttributes: { autocapitalize: "off" },
                      showCancelButton: true,
                      confirmButtonText: "Look up",
                      showLoaderOnConfirm: true,
                      preConfirm: async (login) => {
                        try {
                          const response = await fetch(`//api.github.com/users/${login}`);
                          if (!response.ok) {
                            throw new Error(response.statusText);
                          }
                          return await response.json();
                        } catch (error) {
                          swal.showValidationMessage(`Request failed: ${error}`);
                        }
                      },
                      allowOutsideClick: () => !swal.isLoading()
                    })
                    .then((result) => {
                      if (result.value) {
                        swal.fire({
                          title: `${result.value.login}'s avatar`,
                          imageUrl: result.value.avatar_url
                        });
                      }
                    });
                }}>
                Alert with Server Request
              </Button>

              <Button
                onClick={() => {
                  swal.fire({
                    title: "Custom Position",
                    confirmButtonText: "Ok",
                    position: "top-end",
                    icon: "success",
                    text: "Your public IP will be received via AJAX request",
                    footer: `<a href="https://daneden.github.io/animate.css/">positions?</a>`
                  });
                }}>
                Alert with Positioning
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
