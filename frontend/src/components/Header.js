import React from "react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Container, Navbar, Nav, NavDropdown } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useLogoutMutation } from "../slices/usersApiSlice";
import { logout } from "../slices/authSlice";
import { toast } from "react-toastify";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import Logo from "../assets/images/urban.png";
import "./Header.css"; // Importing the CSS file

const Header = () => {
  const { userInfo } = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [logoutApiCall] = useLogoutMutation();

  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(logout());
      navigate("/");
      toast.success("Logout Successfully!");
    } catch (err) {
      console.error(err);
    }
  };

  const location = useLocation();
  const [activeLink, setActiveLink] = useState(location.pathname);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLinkClick = (url) => {
    setActiveLink(url);
    if (isMobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!isMobileMenuOpen);
  };

  const NavLink = ({ to, children }) => {
    const isActive = location.pathname === to;
    return (
      <Nav.Link
        as={Link}
        to={to}
        className={isActive ? "active nav-link" : "nav-link"}
      >
        {children}
      </Nav.Link>
    );
  };

  return (
    <Navbar
      expand="md"
      style={{
    color: "#1c162c",
    backgroundColor: "#150f23", // Dark purple background
        color: "#fff", // White font
        width: "100%",
        opacity: "0.9", // Slightly transparent
        boxShadow: "0 0 20px black", // Subtle shadow
        fontSize: "20px", // Larger font size
      }}
    >
      <Container>
        <Navbar.Brand as={Link} to="/">
          <img
            src={Logo}
            alt="logo"
            style={{
              width: "100px",
              borderRadius: "35px",
            }}
          />
        </Navbar.Brand>
        <Navbar.Toggle
          aria-controls="responsive-navbar-nav"
          onClick={handleMobileMenuToggle}
        >
          {isMobileMenuOpen ? <CloseIcon style={{ color: "#fff" }} /> : <MenuIcon style={{ color: "#fff" }} />}
        </Navbar.Toggle>
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/pages/features">Features</NavLink>
            <NavLink to="/pages/nutrition-checker">Nutrition Checker</NavLink>
            <NavLink to="/pages/bmr-calculator">BMR</NavLink>
          </Nav>
          <Nav>
            {userInfo ? (
              <NavDropdown
                title={userInfo.name}
                id="username"
                style={{ color: "#fff" }}
              >
                <NavDropdown.Item as={Link} to="/pages/profile">
                  Profile
                </NavDropdown.Item>
                <NavDropdown.Item onClick={logoutHandler}>
                  Logout
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <>
                <Nav.Link as={Link} to="/pages/register">
                  Register
                </Nav.Link>
                <Nav.Link as={Link} to="/pages/login">
                  Login
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
