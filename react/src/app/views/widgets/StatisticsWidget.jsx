import Chart from "react-apexcharts";
import { Card, Col, ProgressBar, Row } from "react-bootstrap";

import Echart1 from "../ui-kits/card-metrics/Echart1";
import Echart2 from "../ui-kits/card-metrics/Echart2";
import Echart3 from "../ui-kits/card-metrics/Echart3";
import Echart4 from "../ui-kits/card-metrics/Echart4";
import Echart5 from "../ui-kits/card-metrics/Echart5";
import Echart6 from "../ui-kits/card-metrics/Echart6";
import Echart7 from "../ui-kits/card-metrics/Echart7";
import Echart8 from "../ui-kits/card-metrics/Echart8";
import Echart9 from "../ui-kits/card-metrics/Echart9";
import Echart10 from "../ui-kits/card-metrics/Echart10";

import Breadcrumb from "app/components/Breadcrumb";

import {
  bAOptions1,
  bAOptions2,
  bAOptions3,
  bAOptions4,
  bAOptions5,
  bAOptions6,
  bAOptions7,
  bAOptions8,
  bAOptions9,
  bAOptions10,
  bAOptions11,
  bAOptions12,
  bAOptions13,
  bAOptions14,
  bAOptions15,
  bAOptions16,
  bAOptions17,
  bAOptions18,
  bAOptions19,
  bAOptions20,
  bAOptions21,
  bAOptions22,
  bAOptions23
} from "./options/statisticsWidgetChartOptions";

export default function StatisticsWidget() {
  const state = {
    cardList1: [
      { icon: "i-Car-Items", title: "New Leads", amount: 205 },
      { icon: "i-Data-Download", title: "Download", amount: 4021 },
      { icon: "i-Cube-Molecule-2", title: "Feedback", amount: 80 },
      { icon: "i-File-Horizontal-Text", title: "Option", amount: 1200 }
    ],

    chartList1: [
      { title: "INCOME", amount: 1000, chart: bAOptions1 },
      { title: "APPROVE", amount: 500, chart: bAOptions2 },
      { title: "TRANSACTION", amount: 44909, chart: bAOptions3 },
      { title: "SALES", amount: 500, chart: bAOptions4 }
    ],

    chartList2: [
      { icon: "i-Like-2", title: "Approve", amount: 55000, chart: bAOptions5 },
      { icon: "i-File-Horizontal-Text", title: "Comments", amount: 500, chart: bAOptions6 },
      { icon: "i-Cube-Molecule-2", title: "Contribution", amount: 46000, chart: bAOptions7 },
      { icon: "i-Eye", title: "Watch", amount: 70000, chart: bAOptions8 }
    ],

    chartList3: [
      { title: "People", amount: 2750, chart: bAOptions9 },
      { title: "Use", amount: "75%", chart: bAOptions10 },
      { title: "Views", amount: 2750, chart: bAOptions11 },
      { title: "Growth", amount: 6760, chart: bAOptions12 }
    ],

    chartList4: [
      { amount: 698212, chart: bAOptions13 },
      { amount: 369212, chart: bAOptions14 },
      { amount: 369212, chart: bAOptions15 },
      { amount: 369212, chart: bAOptions16 }
    ],
    cardList2: [
      { icon: "i-Building", color: "text-primary", title: "Assets", amount: "46,025" },
      { icon: "i-Bar-Chart", color: "text-danger", title: "Progression", amount: "80%" },
      { icon: "i-Full-Cart", color: "text-success", title: "Total Profit", amount: "\u09F3 2000" },
      { icon: "i-Bookmark", color: "text-warning", title: "Lease", amount: "5,417" }
    ],
    chartList5: [
      { title: "People Choice Rate", chart: bAOptions17 },
      { title: "Item Pending", chart: bAOptions18 },
      { title: "Total Profit", chart: bAOptions19 },
      { title: "Total Revenue", chart: bAOptions20 }
    ],
    chartList6: [
      { title: "Orders Received", chart: bAOptions21, amount: 697 },
      { title: "Total Marketing", chart: bAOptions22, amount: "5,767" },
      { title: "Total Earning", chart: bAOptions23, amount: "$5,767" }
    ],
    cardList3: [
      {
        title: "Server status region 1",
        subtitle: "Last down 4 days ago",
        icon: "i-Arrow-Up-in-Circle",
        color: "success",
        message: "Up"
      },
      {
        title: "Server status region 2",
        subtitle: "Last down 8 days ago",
        icon: "i-Arrow-Up-in-Circle",
        color: "success",
        message: "Up"
      },
      {
        title: "Server status region 3",
        subtitle: "Last down 22 days ago",
        icon: "i-Arrow-Down-in-Circle",
        color: "danger",
        message: "Down"
      },
      {
        title: "Server status region 4",
        subtitle: "Last down 2 days ago",
        icon: "i-Arrow-Down-in-Circle",
        color: "danger",
        message: "Down"
      }
    ]
  };

  let {
    cardList1,
    cardList2,
    cardList3,
    chartList1,
    chartList2,
    chartList3,
    chartList4,
    chartList5,
    chartList6
  } = state;

  return (
    <div>
      <Breadcrumb routeSegments={[{ name: "Widgets", path: "/widgets" }, { name: "Statistics" }]} />

      <Row>
        {cardList1.map((card, ind) => (
          <Col md={3} sm={6} className="mb-4" key={ind}>
            <Card body className="card-icon-bg card-icon-bg-primary text-center o-hidden">
              <i className={card.icon} />

              <div className="content">
                <p className="text-muted mt-2 mb-0">{card.title}</p>
                <p className="text-primary text-24 line-height-1 mb-2">{card.amount}</p>
              </div>
            </Card>
          </Col>
        ))}

        {chartList1.map((item, ind) => (
          <Col md={3} className="mb-4" key={ind}>
            <Card body className="o-hidden">
              <div className="ul-widget__chart-info">
                <h5 className="heading">{item.title}</h5>
                <div className="ul-widget__chart-number">
                  <h2 className="t-font-boldest">${item.amount}</h2>
                  <small className="text-muted">46% compared to last year</small>
                </div>
              </div>
              <Chart options={item.chart} series={item.chart.series} type="area" height="100" />
            </Card>
          </Col>
        ))}

        {chartList2.map((item, ind) => (
          <Col md={3} className="mb-4" key={ind}>
            <Card className="o-hidden">
              <Card.Body className="ul-card__widget-chart">
                <div className="ul-widget__chart-info">
                  <h5 className="heading text-20 line-height-1 mb-3">
                    <i className={item.icon} /> {item.title}
                  </h5>

                  <div className="ul-widget__chart-number">
                    <h6 className="">{item.amount.toLocaleString()}</h6>
                  </div>
                </div>

                <Chart options={item.chart} series={item.chart.series} type="area" height="100" />
              </Card.Body>
            </Card>
          </Col>
        ))}

        {chartList3.map((item, ind) => (
          <Col md={3} className="mb-4" key={ind}>
            <Card body className="o-hidden h-100">
              <div className="ul-widget__row">
                <Chart
                  options={item.chart}
                  series={item.chart.series}
                  type={item.chart.chart.type}
                />

                <div className="ul-widget__content">
                  <p className=" text-mute m-0">{item.title}</p>
                  <h4 className="heading">{item.amount}</h4>
                </div>
              </div>
            </Card>
          </Col>
        ))}

        {chartList4.map((item, ind) => (
          <Col md={3} key={ind} className="mb-4">
            <Card body className="o-hidden">
              <div className="ul-widget__row-v2">
                <Chart
                  height="100"
                  options={item.chart}
                  series={item.chart.series}
                  type={item.chart.chart.type}
                />

                <div className="ul-widget__content-v2">
                  <h4 className="heading mt-3">{item.amount}</h4>
                  <small className=" text-muted m-0">50% Average</small>
                </div>
              </div>
            </Card>
          </Col>
        ))}

        {cardList2.map((item, ind) => (
          <Col md={3} className="mb-4" key={ind}>
            <Card body>
              <div className="ul-widget__row">
                <div className="ul-widget-stat__font">
                  <i className={`${item.icon} ${item.color}`} />
                </div>
                <div className="ul-widget__content">
                  <p className=" m-0">{item.title}</p>
                  <h4 className="heading">{item.amount}</h4>
                </div>
              </div>
            </Card>
          </Col>
        ))}

        {chartList5.map((item, ind) => (
          <Col md={3} key={ind} className="mb-4">
            <Card body className="o-hidden">
              <Chart options={item.chart} series={item.chart.series} type={item.chart.chart.type} />
              <h4 className="heading mt-3 text-center">{item.title}</h4>
            </Card>
          </Col>
        ))}

        {chartList6.map((item, ind) => (
          <Col md={4} className="mb-4" key={ind}>
            <Card className="o-hidden">
              <Card.Body className="text-center">
                <h3 className="heading mt-3">{item.amount}</h3>
                <small className=" text-muted m-0">{item.title}</small>
              </Card.Body>

              <Chart
                height="100"
                options={item.chart}
                series={item.chart.series}
                type={item.chart.chart.type}
              />
            </Card>
          </Col>
        ))}

        {cardList3.map((item, ind) => (
          <Col md={3} className="mb-4" key={ind}>
            <Card body>
              <h6 className="mb-3">{item.title}</h6>
              <p className={`text-20 text-${item.color} line-height-1 mb-3`}>
                <i className="i-Arrow-Down-in-Circle" /> {item.message}
              </p>
              <small className="text-muted">{item.subtitle}</small>
            </Card>
          </Col>
        ))}
      </Row>

      <Row>
        <Col md={3} className="mb-4">
          <Card body>
            <h6 className="mb-1">Taffic in last 24h</h6>
            <p className="text-22 text-success font-weight-light mb-1">13000</p>
            <Echart1 height="65px" />
          </Card>
        </Col>

        <Col md={3} className="mb-4">
          <Card body>
            <h6 className="mb-1">Taffic in last week</h6>
            <p className="text-22 text-danger font-weight-light mb-1">65058</p>
            <Echart2 height="65px" />
          </Card>
        </Col>

        <Col md={3} className="mb-4">
          <Card body>
            <h6 className="mb-1">Taffic in last month</h6>
            <p className="text-22 text-success font-weight-light mb-1">165058</p>
            <Echart3 height="65px" />
          </Card>
        </Col>

        <Col md={3} className="mb-4">
          <Card body>
            <h6 className="mb-1">Taffic in last 3 months</h6>
            <p className="text-22 text-danger font-weight-light mb-1">1065058</p>
            <Echart4 height="65px" />
          </Card>
        </Col>

        <Col md={3} className="mb-4">
          <Card body>
            <h6 className="mb-2 text-muted">Storage Usage</h6>
            <p className="mb-1 text-22 font-weight-light">50%</p>
            <ProgressBar variant="success" now={50} style={{ height: "4px" }} />
            <small className="text-muted">Most data used in last 3 days</small>
          </Card>
        </Col>

        <Col md={3} className="mb-4">
          <Card body>
            <h6 className="mb-2 text-muted">Bandwith Usage</h6>
            <p className="mb-1 text-22 font-weight-light">90%</p>
            <ProgressBar variant="danger" now={90} style={{ height: "4px" }} />
            <small className="text-muted">Most data used in last 7 days</small>
          </Card>
        </Col>

        <Col md={3} className="mb-4">
          <Card body>
            <h6 className="mb-2 text-muted">Data Usage</h6>
            <p className="mb-1 text-22 font-weight-light">60%</p>
            <ProgressBar variant="warning" now={60} style={{ height: "4px" }} />
            <small className="text-muted">Most data used in last 5 days</small>
          </Card>
        </Col>

        <Col md={3} className="mb-4">
          <Card body>
            <h6 className="mb-2 text-muted">Data Usage</h6>
            <p className="mb-1 text-22 font-weight-light">60%</p>
            <ProgressBar variant="info" now={60} style={{ height: "4px" }} />
            <small className="text-muted">Most data used in last 4 days</small>
          </Card>
        </Col>

        <Col md={3} className="mb-4">
          <Card body>
            <h6 className="mb-0 text-muted">Registration/Subscription</h6>
            <p className="text-22 font-weight-light mb-1">20/80</p>
            <Echart5 height="140px" />
          </Card>
        </Col>

        <Col md={3} className="mb-4">
          <Card body>
            <h6 className="mb-0 text-muted">Project Running/Completed</h6>
            <p className="text-22 font-weight-light mb-1">40/60</p>
            <Echart6 height="140px" />
          </Card>
        </Col>

        <Col md={3} className="mb-4">
          <Card body>
            <h6 className="mb-0 text-muted">Registration/Subscription</h6>
            <p className="text-22 font-weight-light mb-1">20/80</p>
            <Echart7 height="140px" />
          </Card>
        </Col>

        <Col md={3} className="mb-4">
          <Card body>
            <h6 className="mb-0 text-muted">Project Running/Completed</h6>
            <p className="text-22 font-weight-light mb-1">40/60</p>
            <Echart8 height="140px" />
          </Card>
        </Col>

        <Col md={3} className="mb-4">
          <Card body>
            <h6 className="mb-2 text-muted">Project Completion Rate</h6>
            <p className="text-22 font-weight-light mb-1">
              <i className="i-Up text-success" /> 15%
            </p>

            <Echart9 height="60px" />
          </Card>
        </Col>

        <Col md={3}>
          <Card body>
            <h6 className="mb-2 text-muted">Project Completion Rate</h6>
            <p className="text-22 font-weight-light mb-1">
              <i className="i-Down text-danger" /> 15%
            </p>

            <Echart10 height="60px" />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
