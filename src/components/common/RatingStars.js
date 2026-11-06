import PropTypes from "prop-types";

// Hiển thị sao; nếu có onChange thì trở thành ô chọn số sao.
function RatingStars({ value, onChange }) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <span className="rating-stars" aria-label={`${value} trên 5 sao`}>
      {stars.map((star) =>
        onChange ? (
          <button
            key={star}
            type="button"
            className={`star-btn ${star <= value ? "on" : ""}`}
            onClick={() => onChange(star)}
            aria-label={`${star} sao`}
          >
            ★
          </button>
        ) : (
          <span key={star} className={star <= Math.round(value) ? "on" : ""}>
            ★
          </span>
        )
      )}
    </span>
  );
}

RatingStars.propTypes = {
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func,
};

export default RatingStars;
