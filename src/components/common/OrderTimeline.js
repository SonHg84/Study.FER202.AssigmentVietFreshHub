import PropTypes from "prop-types";
import { ORDER_FLOW, ORDER_STATUS } from "../../utils/constants";
import { formatDateTime } from "../../utils/format";

// Dòng thời gian trạng thái đơn hàng (theo dõi đơn).
function OrderTimeline({ history, status }) {
  const steps = status === "CANCELLED" ? history.map((h) => h.status) : ORDER_FLOW;
  return (
    <ol className="order-timeline">
      {steps.map((step) => {
        const record = history.find((h) => h.status === step);
        return (
          <li key={step} className={record ? (step === "CANCELLED" ? "done cancelled" : "done") : ""}>
            <span className="dot" />
            <div>
              <div className="fw-semibold">{ORDER_STATUS[step].label}</div>
              <small className="text-muted">{record ? formatDateTime(record.at) : "Chưa tới bước này"}</small>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

OrderTimeline.propTypes = {
  history: PropTypes.arrayOf(
    PropTypes.shape({
      status: PropTypes.oneOf(Object.keys(ORDER_STATUS)).isRequired,
      at: PropTypes.string.isRequired,
    })
  ).isRequired,
  status: PropTypes.oneOf(Object.keys(ORDER_STATUS)).isRequired,
};

export default OrderTimeline;
