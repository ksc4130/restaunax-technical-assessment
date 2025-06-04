import { Box, CssBaseline, Typography, CircularProgress, Button, Dialog, DialogContent, IconButton, Chip } from "@mui/material";
import { Add, Close, FilterList } from "@mui/icons-material";
import SideNav from "../components/SideNav";
import { useEffect, useState } from "react";
import { useMenuItems } from "../stores/menuItemStore";
import { MenuItems } from "../components/MenuItems/MenuItems";
import OrderSummary from "../components/OrderSummary";
import { CreateMenuItemForm } from "../components/CreateMenuItemForm";
import { EditMenuItemForm } from "../components/EditMenuItemForm";
import { DeleteMenuItemDialog } from "../components/DeleteMenuItemDialog";
import { useSnackbar } from "notistack";
import type { MenuItem } from "../services/menuItemService";

const Menu = () => {
  const [error] = useState<string | null>(null);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [categories, setCategories] = useState<string[]>([]);
  const { fetchMenuItems, menuItems, menuItemsLoading } = useMenuItems();
  const { enqueueSnackbar } = useSnackbar();

  // Extract unique categories from menu items
  useEffect(() => {
    if (menuItems.length > 0) {
      const uniqueCategories = Array.from(
        new Set(menuItems.map((item) => item.category || "Uncategorized"))
      ).filter(Boolean);
      setCategories(uniqueCategories as string[]);
    }
  }, [menuItems]);

  const handleOpenCreateDialog = () => {
    setOpenCreateDialog(true);
  };

  const handleCloseCreateDialog = () => {
    setOpenCreateDialog(false);
  };

  const handleCreateSuccess = () => {
    // Close the dialog after a short delay to show the success message
    setTimeout(() => {
      setOpenCreateDialog(false);
    }, 1500);
    enqueueSnackbar("Menu item created successfully", { variant: "success" });
  };

  const handleEditMenuItem = (menuItem: MenuItem) => {
    setSelectedMenuItem(menuItem);
    setOpenEditDialog(true);
  };

  const handleDeleteMenuItem = (menuItem: MenuItem) => {
    setSelectedMenuItem(menuItem);
    setOpenDeleteDialog(true);
  };

  const handleEditSuccess = () => {
    // Close the dialog after a short delay to show the success message
    setTimeout(() => {
      setOpenEditDialog(false);
    }, 1500);
    enqueueSnackbar("Menu item updated successfully", { variant: "success" });
  };

  const handleDeleteSuccess = () => {
    enqueueSnackbar("Menu item deleted successfully", { variant: "success" });
  };


  const handleCategoryChange = (category: string, event: React.MouseEvent) => {
    event.preventDefault();
    setSelectedCategory(category === selectedCategory ? "" : category);
  };

  useEffect(() => {
    fetchMenuItems(selectedCategory);
  }, [fetchMenuItems, selectedCategory]);

  // Show loading state while data is being fetched
  if (menuItemsLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          height: "100vh",
          justifyContent: "center",
          alignItems: "center",
          bgcolor: "background.default",
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  // Show error state if data fetching failed
  if (error) {
    return (
      <Box
        sx={{
          display: "flex",
          height: "100vh",
          justifyContent: "center",
          alignItems: "center",
          bgcolor: "background.default",
          color: "error.main",
          flexDirection: "column",
          p: 3,
          textAlign: "center",
        }}
      >
        <Typography variant="h5" gutterBottom>
          Error Loading Menu
        </Typography>
        <Typography>{error}</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        bgcolor: "background.default",
        color: "text.primary",
      }}
    >
      <CssBaseline />
      <SideNav />
      <Box sx={{ flex: 1, p: 3, overflowY: "auto" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            Menu Items
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<Add />}
            onClick={handleOpenCreateDialog}
          >
            Create Menu Item
          </Button>
        </Box>

        {/* Category Filter */}
        <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Chip 
            icon={<FilterList />} 
            label="All" 
            onClick={(event) => {
              event.preventDefault();
              setSelectedCategory("");
            }}
            color={selectedCategory === "" ? "primary" : "default"}
            variant={selectedCategory === "" ? "filled" : "outlined"}
            sx={{ mb: 1 }}
          />
          {categories.map((category) => (
            <Chip 
              key={category} 
              label={category} 
              onClick={(event) => handleCategoryChange(category, event)}
              color={selectedCategory === category ? "primary" : "default"}
              variant={selectedCategory === category ? "filled" : "outlined"}
              sx={{ mb: 1 }}
            />
          ))}
        </Box>

        {/* Menu Items Section */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(12, 1fr)",
            gap: 3,
            mb: 4,
          }}
        >
          <Box
            sx={{ gridColumn: { xs: "span 12", sm: "span 12", md: "span 12" } }}
          >
            <Box
              sx={{ height: "100%", bgcolor: "#2c2c2e", borderRadius: 1, p: 2 }}
            >
             
              <MenuItems
                items={menuItems}
                loading={menuItemsLoading}
                error={error}
                onEdit={handleEditMenuItem}
                onDelete={handleDeleteMenuItem}
              />
            </Box>
          </Box>
        </Box>

        {/* Create Menu Item Dialog */}
        <Dialog 
          open={openCreateDialog} 
          onClose={handleCloseCreateDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogContent sx={{ position: "relative", p: 0 }}>
            <IconButton
              aria-label="close"
              onClick={handleCloseCreateDialog}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <Close />
            </IconButton>
            <CreateMenuItemForm 
              onSuccess={handleCreateSuccess}
              onCancel={handleCloseCreateDialog}
            />
          </DialogContent>
        </Dialog>

        {/* Edit Menu Item Dialog */}
        <EditMenuItemForm
          open={openEditDialog}
          menuItem={selectedMenuItem}
          onClose={() => setOpenEditDialog(false)}
          onSuccess={handleEditSuccess}
        />

        {/* Delete Menu Item Dialog */}
        <DeleteMenuItemDialog
          open={openDeleteDialog}
          menuItem={selectedMenuItem}
          onClose={() => setOpenDeleteDialog(false)}
          onSuccess={handleDeleteSuccess}
        />
      </Box>
      <Box
        sx={{
          width: { xs: "100%", sm: 320 },
          height: { xs: "auto", sm: "100vh" },
          position: { xs: "static", sm: "relative" },
          display: { xs: "none", sm: "block" }, // Hide on mobile to prevent layout issues
        }}
      >
        <OrderSummary />
      </Box>
    </Box>
  );
};

export default Menu;
