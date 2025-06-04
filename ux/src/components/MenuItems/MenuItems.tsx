import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Button,
  Snackbar,
  Alert,
  Badge,
  IconButton,
  Menu,
  MenuItem as MuiMenuItem,
} from "@mui/material";
import React, { useState } from "react";
import { useOrders } from "../../stores/orderStore";
import { Add, Remove, MoreVert, Edit, Delete } from "@mui/icons-material";
import type { MenuItem as MenuItemType } from "../../services/menuItemService";

type MenuItemsProps = {
  items: MenuItemType[];
  loading: boolean;
  error: string | null;
  onEdit?: (menuItem: MenuItemType) => void;
  onDelete?: (menuItem: MenuItemType) => void;
};

export const MenuItems: React.FC<MenuItemsProps> = ({
  items,
  loading,
  error,
  onEdit,
  onDelete,
}) => {
  const { addToCart, removeFromCart, updateCartItemQuantity, cartItems } =
    useOrders();
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItemType | null>(null);

  const handleAddToCart = (dish: MenuItemType) => {
    addToCart(dish, 1);
    setSnackbarMessage(`Added ${dish.name} to your order`);
    setShowSnackbar(true);
  };

  const handleRemoveFromCart = (dish: MenuItemType) => {
    const qty = getCartQuantity(dish.id);

    if (qty === 1) {
      removeFromCart(dish.id);
      setSnackbarMessage(`Removed ${dish.name} from your order`);
    } else {
      updateCartItemQuantity(dish.id, qty - 1);
      setSnackbarMessage(`Removed one ${dish.name} from your order`);
    }

    setShowSnackbar(true);
  };

  const getCartQuantity = (menuItemId: number): number => {
    const item = cartItems.find((item) => item.menuItem.id === menuItemId);
    return item ? item.quantity : 0;
  };

  const handleCloseSnackbar = () => {
    setShowSnackbar(false);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, menuItem: MenuItemType) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setSelectedMenuItem(menuItem);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedMenuItem(null);
  };

  const handleEdit = () => {
    if (selectedMenuItem && onEdit) {
      onEdit(selectedMenuItem);
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    if (selectedMenuItem && onDelete) {
      onDelete(selectedMenuItem);
    }
    handleMenuClose();
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, color: "error.main" }}>
        <Typography>Error: {error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: 2,
        }}
      >
        {items.map((dish) => (
          <Badge
            key={dish.id || dish.name}
            badgeContent={getCartQuantity(dish.id)}
            color="primary"
            showZero={false}
            sx={{
              "& .MuiBadge-badge": {
                fontSize: "0.8rem",
                height: "22px",
                minWidth: "22px",
                borderRadius: "11px",
              },
            }}
          >
            <Card
              sx={{
                width: "100%",
                bgcolor: "#2c2c2e",
                color: "white",
                transition: "transform 0.2s ease-in-out",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: "0 10px 20px rgba(0,0,0,0.2)",
                },
              }}
            >
              <CardContent
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  position: "relative",
                  padding: 3, // Increased padding for the card content
                  height: "100%", // Make all cards the same height
                }}
              >
                {(onEdit || onDelete) && (
                  <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, dish)}
                      sx={{ color: 'white' }}
                    >
                      <MoreVert fontSize="small" />
                    </IconButton>
                  </Box>
                )}
                <Box sx={{ fontSize: 40, mb: 2 }}>
                  <img src={dish.imagePath} alt={dish.name} width="60" />
                </Box>
                <Typography
                  title={dish.name}
                  variant="h6"
                  noWrap
                  sx={{ width: "100%", textAlign: "center", mb: 1 }}
                >
                  {dish.name}
                </Typography>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  Starting From
                </Typography>
              <Typography variant="h6" sx={{ mb: 2 }}>
                $ {dish.price}
              </Typography>

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    width: "100%",
                    mt: "auto", // Push to the bottom
                    pt: 3, // Add padding top instead of margin top
                    gap: 1,
                  }}
                >
                  {getCartQuantity(dish.id) > 0 ? (
                    <>
                      <Button
                        variant="contained"
                        startIcon={<Remove />}
                        sx={{
                          flex: 1,
                          bgcolor: "error.main",
                          color: "white",
                          padding: "10px 0",
                          "&:hover": {
                            bgcolor: "error.dark",
                          },
                        }}
                        onClick={() => handleRemoveFromCart(dish)}
                      >
                        Remove
                      </Button>

                      <Button
                        variant="contained"
                        startIcon={<Add />}
                        sx={{
                          flex: 1,
                          bgcolor: "primary.main",
                          color: "white",
                          padding: "10px 0",
                          "&:hover": {
                            bgcolor: "primary.dark",
                          },
                        }}
                        onClick={() => handleAddToCart(dish)}
                      >
                        Add More
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="contained"
                      startIcon={<Add />}
                      fullWidth
                      sx={{
                        bgcolor: "rgba(255,255,255,0.2)",
                        color: "white",
                        padding: "10px 0",
                        "&:hover": {
                          bgcolor: "primary.main",
                        },
                      }}
                      onClick={() => handleAddToCart(dish)}
                    >
                      Add to Order
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Badge>
        ))}
      </Box>

      {/* Menu for edit/delete actions */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        {onEdit && (
          <MuiMenuItem onClick={handleEdit}>
            <Edit fontSize="small" sx={{ mr: 1 }} />
            Edit
          </MuiMenuItem>
        )}
        {onDelete && (
          <MuiMenuItem onClick={handleDelete}>
            <Delete fontSize="small" sx={{ mr: 1 }} />
            Delete
          </MuiMenuItem>
        )}
      </Menu>

      <Snackbar
        open={showSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="success"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};