import React from "react";
import PropTypes from "prop-types";
import { Alert, Button, Container } from "react-bootstrap";

/**
 * Class component (stateful) bắt lỗi render của các component con.
 * Dùng lifecycle: constructor, getDerivedStateFromError, componentDidCatch, render.
 */
class ErrorBoundary extends React.Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error, info) {
    console.error("Lỗi giao diện:", error, info.componentStack);
  }

  handleReload = () => {
    this.setState({ hasError: false, message: "" });
    window.location.assign("/");
  };

  render() {
    if (this.state.hasError) {
      return (
        <Container className="py-5">
          <Alert variant="danger">
            <Alert.Heading>Đã có lỗi xảy ra</Alert.Heading>
            <p className="mb-3">{this.state.message}</p>
            <Button variant="outline-danger" onClick={this.handleReload}>
              Về trang chủ
            </Button>
          </Alert>
        </Container>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
