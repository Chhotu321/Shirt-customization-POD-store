"use client"

import { useState, useEffect, useRef } from "react"
import { useForm } from "react-hook-form"
import {
  X,
  Upload,
  RefreshCw,
  Palette,
  Check,
  Shirt,
  Type,
  Move,
  Save,
  Trash2,
  Edit,
  List,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from "lucide-react"
import Draggable from "react-draggable"
import "./index.css"

// Theme configurations with enhanced colors and styles
const themes = [
  {
    name: "Modern",
    primaryColor: "bg-violet-600",
    secondaryColor: "bg-violet-50",
    textColor: "text-violet-800",
    borderColor: "border-violet-200",
    buttonColor: "bg-violet-600 hover:bg-violet-700",
    inputBg: "bg-white",
    cardBg: "bg-white",
    accent: "bg-pink-500",
    shadow: "shadow-violet-100",
  },
  {
    name: "Minimal",
    primaryColor: "bg-slate-800",
    secondaryColor: "bg-slate-50",
    textColor: "text-slate-800",
    borderColor: "border-slate-200",
    buttonColor: "bg-slate-800 hover:bg-slate-900",
    inputBg: "bg-slate-50",
    cardBg: "bg-white",
    accent: "bg-slate-600",
    shadow: "shadow-slate-100",
  },
  {
    name: "Vibrant",
    primaryColor: "bg-emerald-600",
    secondaryColor: "bg-emerald-50",
    textColor: "text-emerald-800",
    borderColor: "border-emerald-200",
    buttonColor: "bg-emerald-600 hover:bg-emerald-700",
    inputBg: "bg-white",
    cardBg: "bg-white",
    accent: "bg-yellow-500",
    shadow: "shadow-emerald-100",
  },
]

// Sample t-shirt colors
const tshirtColors = [
  { name: "White", value: "#ffffff" },
  { name: "Black", value: "#000000" },
  { name: "Navy", value: "#0a192f" },
  { name: "Red", value: "#e11d48" },
  { name: "Green", value: "#059669" },
]

// Font options
const fontOptions = [
  { name: "Sans Serif", value: "'Inter', sans-serif" },
  { name: "Serif", value: "'Merriweather', serif" },
  { name: "Monospace", value: "'Roboto Mono', monospace" },
  { name: "Handwriting", value: "'Caveat', cursive" },
  { name: "Display", value: "'Bebas Neue', cursive" },
]

// Font sizes
const fontSizes = [
  { name: "Small", value: "14px" },
  { name: "Medium", value: "18px" },
  { name: "Large", value: "24px" },
  { name: "X-Large", value: "32px" },
]

// Font colors
const fontColors = [
  { name: "Black", value: "#000000" },
  { name: "White", value: "#ffffff" },
  { name: "Red", value: "#e11d48" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Yellow", value: "#eab308" },
]

export default function App() {
  const [activeTheme, setActiveTheme] = useState(0)
  const [currentView, setCurrentView] = useState("front") // 'front' or 'back'

  // Front view state
  const [frontImage, setFrontImage] = useState(null)
  const [frontTextPosition, setFrontTextPosition] = useState({ x: 0, y: 0 })
  const [frontZoomLevel, setFrontZoomLevel] = useState(1)
  const [frontPanPosition, setFrontPanPosition] = useState({ x: 0, y: 0 })

  // Back view state
  const [backImage, setBackImage] = useState(null)
  const [backTextPosition, setBackTextPosition] = useState({ x: 0, y: 0 })
  const [backZoomLevel, setBackZoomLevel] = useState(1)
  const [backPanPosition, setBackPanPosition] = useState({ x: 0, y: 0 })

  // Common state
  const [isDragging, setIsDragging] = useState(false)
  const [selectedColor, setSelectedColor] = useState(tshirtColors[0])
  const [showSuccessToast, setShowSuccessToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const [savedCustomizations, setSavedCustomizations] = useState([])
  const [showSavedList, setShowSavedList] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [selectedFont, setSelectedFont] = useState(fontOptions[0])
  const [selectedFontSize, setSelectedFontSize] = useState(fontSizes[1])
  const [selectedFontColor, setSelectedFontColor] = useState(fontColors[0])
  const [textIsBold, setTextIsBold] = useState(false)
  const [textIsItalic, setTextIsItalic] = useState(false)
  const [isPanning, setIsPanning] = useState(false)

  const theme = themes[activeTheme]
  const previewRef = useRef(null)

  // Computed values based on current view
  const uploadedImage = currentView === "front" ? frontImage : backImage
  const setUploadedImage = currentView === "front" ? setFrontImage : setBackImage
  const textPosition = currentView === "front" ? frontTextPosition : backTextPosition
  const setTextPosition = currentView === "front" ? setFrontTextPosition : setBackTextPosition
  const zoomLevel = currentView === "front" ? frontZoomLevel : backZoomLevel
  const setZoomLevel = currentView === "front" ? setFrontZoomLevel : setBackZoomLevel
  const panPosition = currentView === "front" ? frontPanPosition : backPanPosition
  const setPanPosition = currentView === "front" ? setFrontPanPosition : setBackPanPosition

  // Form for front view
  const frontForm = useForm({
    defaultValues: {
      height: 180,
      weight: 80,
      build: "athletic",
      frontText: "",
      size: "M",
    },
  })

  // Form for back view
  const backForm = useForm({
    defaultValues: {
      backText: "",
    },
  })

  // Get the active form based on current view
  const activeForm = currentView === "front" ? frontForm : backForm
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = activeForm

  // Get the text field name based on current view
  const textFieldName = currentView === "front" ? "frontText" : "backText"

  // Load saved customizations from localStorage on initial render
  useEffect(() => {
    const savedItems = localStorage.getItem("tshirtCustomizations")
    if (savedItems) {
      setSavedCustomizations(JSON.parse(savedItems))
    }
  }, [])

  // Handle Alt+Q for theme switching
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.altKey && e.key === "q") {
        setActiveTheme((prev) => (prev + 1) % themes.length)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  // Handle form submission
  const onSubmit = (data) => {
    // Combine data from both forms
    const combinedData = {
      ...frontForm.getValues(),
      ...backForm.getValues(),
    }

    const customization = {
      id: editingId || Date.now().toString(),
      name: combinedData.frontText?.substring(0, 20) || `Design ${savedCustomizations.length + 1}`,
      data: {
        ...combinedData,
        tshirtColor: selectedColor,
        frontImage: frontImage,
        backImage: backImage,
        frontTextPosition: frontTextPosition,
        backTextPosition: backTextPosition,
        font: selectedFont,
        fontSize: selectedFontSize,
        fontColor: selectedFontColor,
        textIsBold: textIsBold,
        textIsItalic: textIsItalic,
        theme: activeTheme,
        frontZoomLevel: frontZoomLevel,
        backZoomLevel: backZoomLevel,
        frontPanPosition: frontPanPosition,
        backPanPosition: backPanPosition,
      },
      createdAt: editingId
        ? savedCustomizations.find((item) => item.id === editingId)?.createdAt || new Date().toISOString()
        : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    if (editingId) {
      // Update existing customization
      const updatedCustomizations = savedCustomizations.map((item) => (item.id === editingId ? customization : item))
      setSavedCustomizations(updatedCustomizations)
      localStorage.setItem("tshirtCustomizations", JSON.stringify(updatedCustomizations))
      setEditingId(null)
      setToastMessage("Customization updated successfully!")
    } else {
      // Save new customization
      const newCustomizations = [...savedCustomizations, customization]
      setSavedCustomizations(newCustomizations)
      localStorage.setItem("tshirtCustomizations", JSON.stringify(newCustomizations))
      setToastMessage("Customization saved successfully!")
    }

    setShowSuccessToast(true)
    setTimeout(() => setShowSuccessToast(false), 3000)
  }

  // Load a saved customization
  const loadCustomization = (customization) => {
    const { data } = customization

    // Reset front form with saved data
    frontForm.reset({
      height: data.height,
      weight: data.weight,
      build: data.build,
      frontText: data.frontText,
      size: data.size,
    })

    // Reset back form with saved data
    backForm.reset({
      backText: data.backText,
    })

    // Set other state values
    setSelectedColor(data.tshirtColor)
    setFrontImage(data.frontImage)
    setBackImage(data.backImage)
    setFrontTextPosition(data.frontTextPosition || { x: 0, y: 0 })
    setBackTextPosition(data.backTextPosition || { x: 0, y: 0 })
    setSelectedFont(data.font)
    setSelectedFontSize(data.fontSize)
    setSelectedFontColor(data.fontColor)
    setTextIsBold(data.textIsBold)
    setTextIsItalic(data.textIsItalic)
    setActiveTheme(data.theme)
    setFrontZoomLevel(data.frontZoomLevel || 1)
    setBackZoomLevel(data.backZoomLevel || 1)
    setFrontPanPosition(data.frontPanPosition || { x: 0, y: 0 })
    setBackPanPosition(data.backPanPosition || { x: 0, y: 0 })

    // Set editing mode
    setEditingId(customization.id)
    setShowSavedList(false)

    setToastMessage("Customization loaded for editing!")
    setShowSuccessToast(true)
    setTimeout(() => setShowSuccessToast(false), 3000)
  }

  // Delete a saved customization
  const deleteCustomization = (id, e) => {
    e.stopPropagation()
    const updatedCustomizations = savedCustomizations.filter((item) => item.id !== id)
    setSavedCustomizations(updatedCustomizations)
    localStorage.setItem("tshirtCustomizations", JSON.stringify(updatedCustomizations))

    if (editingId === id) {
      setEditingId(null)
      frontForm.reset({
        height: 180,
        weight: 80,
        build: "athletic",
        frontText: "",
        size: "M",
      })
      backForm.reset({
        backText: "",
      })
      setFrontImage(null)
      setBackImage(null)
      setFrontTextPosition({ x: 0, y: 0 })
      setBackTextPosition({ x: 0, y: 0 })
      setSelectedFont(fontOptions[0])
      setSelectedFontSize(fontSizes[1])
      setSelectedFontColor(fontColors[0])
      setTextIsBold(false)
      setTextIsItalic(false)
      setFrontZoomLevel(1)
      setBackZoomLevel(1)
      setFrontPanPosition({ x: 0, y: 0 })
      setBackPanPosition({ x: 0, y: 0 })
    }

    setToastMessage("Customization deleted!")
    setShowSuccessToast(true)
    setTimeout(() => setShowSuccessToast(false), 3000)
  }

  // Handle file upload with better error handling and size validation
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Check file type
    if (!file.type.match("image.*")) {
      alert("Please select an image file")
      return
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size should be less than 5MB")
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      setUploadedImage(e.target.result)
    }
    reader.onerror = () => {
      alert("Error reading file")
    }
    reader.readAsDataURL(file)
  }

  // Handle drag and drop with improved visual feedback
  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
    e.dataTransfer.dropEffect = "copy"
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (!file) return

    // Check file type
    if (!file.type.match("image.*")) {
      alert("Please select an image file")
      return
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size should be less than 5MB")
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      setUploadedImage(e.target.result)
    }
    reader.onerror = () => {
      alert("Error reading file")
    }
    reader.readAsDataURL(file)
  }

  // Clear uploaded image
  const clearImage = () => {
    setUploadedImage(null)
  }

  // Handle text drag stop
  const handleDragStop = (e, data) => {
    setTextPosition({ x: data.x, y: data.y })
  }

  // Reset text position
  const resetTextPosition = () => {
    setTextPosition({ x: 0, y: 0 })
  }

  // Handle zoom in
  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.1, 2))
  }

  // Handle zoom out
  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.1, 0.5))
  }

  // Reset zoom
  const resetZoom = () => {
    setZoomLevel(1)
    setPanPosition({ x: 0, y: 0 })
  }

  // Handle pan start
  const handlePanStart = () => {
    setIsPanning(true)
  }

  // Handle pan stop
  const handlePanStop = (e, data) => {
    setIsPanning(false)
    setPanPosition({ x: data.x, y: data.y })
  }

  // Create a new design
  const createNewDesign = () => {
    setEditingId(null)
    frontForm.reset({
      height: 180,
      weight: 80,
      build: "athletic",
      frontText: "",
      size: "M",
    })
    backForm.reset({
      backText: "",
    })
    setFrontImage(null)
    setBackImage(null)
    setFrontTextPosition({ x: 0, y: 0 })
    setBackTextPosition({ x: 0, y: 0 })
    setSelectedFont(fontOptions[0])
    setSelectedFontSize(fontSizes[1])
    setSelectedFontColor(fontColors[0])
    setTextIsBold(false)
    setTextIsItalic(false)
    setFrontZoomLevel(1)
    setBackZoomLevel(1)
    setFrontPanPosition({ x: 0, y: 0 })
    setBackPanPosition({ x: 0, y: 0 })
    setShowSavedList(false)
  }

  // Toggle between front and back views
  const toggleView = () => {
    setCurrentView((prev) => (prev === "front" ? "back" : "front"))
  }

  return (
    <div className={`min-h-screen ${theme.secondaryColor} transition-colors duration-300`}>
      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg animate-in slide-in-from-top">
          <Check size={20} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Saved Designs Modal */}
      {showSavedList && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
          <div className={`${theme.cardBg} rounded-xl shadow-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-xl font-bold ${theme.textColor}`}>Saved Designs</h2>
              <button onClick={() => setShowSavedList(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            {savedCustomizations.length === 0 ? (
              <p className={`text-center py-8 ${theme.textColor}`}>No saved designs yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedCustomizations.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => loadCustomization(item)}
                    className={`p-4 border ${theme.borderColor} rounded-lg cursor-pointer hover:shadow-md transition-shadow flex justify-between items-start`}
                  >
                    <div>
                      <h3 className="font-medium mb-1">{item.name}</h3>
                      <p className="text-xs text-gray-500">Updated: {new Date(item.updatedAt).toLocaleDateString()}</p>
                      <div className="flex gap-2 mt-2">
                        <div
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: item.data.tshirtColor.value }}
                        ></div>
                        <span className="text-xs">{item.data.size}</span>
                        {item.data.frontImage && <span className="text-xs">Front</span>}
                        {item.data.backImage && <span className="text-xs">Back</span>}
                      </div>
                    </div>
                    <button
                      onClick={(e) => deleteCustomization(item.id, e)}
                      className="text-red-500 hover:text-red-700 p-1"
                      aria-label="Delete design"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 flex justify-center">
              <button
                onClick={createNewDesign}
                className={`${theme.buttonColor} text-white py-2 px-4 rounded-lg font-medium transition-colors duration-300 flex items-center gap-2`}
              >
                Create New Design
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className={`${theme.primaryColor} text-white p-6 rounded-t-xl shadow-lg`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Shirt size={28} />
              <h1 className="text-3xl font-bold">T-Shirt Customizer</h1>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowSavedList(true)}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white py-1 px-3 rounded-lg flex items-center gap-1 text-sm transition-colors"
              >
                <List size={16} />
                Saved Designs
              </button>
              {editingId && (
                <button
                  onClick={createNewDesign}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white py-1 px-3 rounded-lg flex items-center gap-1 text-sm transition-colors"
                >
                  <Edit size={16} />
                  New Design
                </button>
              )}
            </div>
          </div>
          <p className="text-center text-sm opacity-90">
            {editingId ? "Editing Saved Design" : "Creating New Design"} |
            {currentView === "front" ? " Front View" : " Back View"} | Theme: {theme.name} (Press Alt+Q to switch)
          </p>
        </div>

        <div className={`${theme.cardBg} rounded-b-xl shadow-xl p-6 ${theme.shadow}`}>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* T-Shirt Preview Section */}
            <div className="md:col-span-1 flex flex-col items-center justify-start">
              {/* View Toggle */}
              <div className="w-full flex justify-center mb-4">
                <div className={`inline-flex rounded-md shadow-sm ${theme.borderColor} border`}>
                  <button
                    type="button"
                    onClick={() => setCurrentView("front")}
                    className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                      currentView === "front" ? `${theme.primaryColor} text-white` : `bg-white ${theme.textColor}`
                    }`}
                  >
                    Front
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentView("back")}
                    className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                      currentView === "back" ? `${theme.primaryColor} text-white` : `bg-white ${theme.textColor}`
                    }`}
                  >
                    Back
                  </button>
                </div>
              </div>

              {/* Zoom Controls */}
              <div className="w-full flex justify-center mb-4 gap-2">
                <button
                  type="button"
                  onClick={handleZoomOut}
                  className={`p-2 rounded-lg ${theme.borderColor} border bg-white ${theme.textColor} hover:bg-gray-50`}
                >
                  <ZoomOut size={16} />
                </button>
                <button
                  type="button"
                  onClick={handleZoomIn}
                  className={`p-2 rounded-lg ${theme.borderColor} border bg-white ${theme.textColor} hover:bg-gray-50`}
                >
                  <ZoomIn size={16} />
                </button>
                <button
                  type="button"
                  onClick={resetZoom}
                  className={`p-2 rounded-lg ${theme.borderColor} border bg-white ${theme.textColor} hover:bg-gray-50`}
                >
                  <RotateCcw size={16} />
                </button>
                <div
                  className={`px-2 py-1 rounded-lg ${theme.borderColor} border bg-white ${theme.textColor} text-xs flex items-center`}
                >
                  {Math.round(zoomLevel * 100)}%
                </div>
              </div>

              <div
                ref={previewRef}
                className="t-shirt-preview aspect-[3/4] relative mb-6 flex items-center justify-center border rounded-xl overflow-hidden"
                style={{ backgroundColor: selectedColor.value }}
              >
                {/* Draggable container for panning */}
                <Draggable position={panPosition} onStart={handlePanStart} onStop={handlePanStop} disabled={!isPanning}>
                  <div
                    className={`absolute inset-0 flex items-center justify-center ${isPanning ? "cursor-move" : ""}`}
                    style={{
                      transform: `scale(${zoomLevel})`,
                      transition: isPanning ? "none" : "transform 0.2s ease-out",
                    }}
                  >
                    {/* Base T-shirt image */}
                    <img
                      src="/placeholder.svg?height=400&width=300"
                      alt="T-Shirt Base"
                      className="absolute inset-0 w-full h-full object-contain"
                      style={{ opacity: 0.9 }}
                    />

                    {/* Uploaded design image */}
                    {uploadedImage && (
                      <div className="design-overlay">
                        <img
                          src={uploadedImage || "/placeholder.svg"}
                          alt="Design Preview"
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                    )}
                  </div>
                </Draggable>

                {/* Custom text overlay - Draggable */}
                {watch(textFieldName) && (
                  <Draggable
                    bounds="parent"
                    defaultPosition={textPosition}
                    position={textPosition}
                    onStop={handleDragStop}
                    disabled={isPanning}
                  >
                    <div
                      className={`${isPanning ? "" : "cursor-move"} absolute`}
                      style={{
                        zIndex: 20,
                        padding: "4px",
                        border: "1px dashed transparent",
                        borderRadius: "4px",
                        touchAction: "none",
                      }}
                    >
                      <p
                        className="t-shirt-text"
                        style={{
                          whiteSpace: "pre-line",
                          fontFamily: selectedFont.value,
                          fontSize: selectedFontSize.value,
                          color: selectedFontColor.value,
                          fontWeight: textIsBold ? "bold" : "normal",
                          fontStyle: textIsItalic ? "italic" : "normal",
                          textShadow:
                            selectedColor.name === "White" && selectedFontColor.name === "White"
                              ? "0 1px 2px rgba(0,0,0,0.5)"
                              : "none",
                        }}
                      >
                        {watch(textFieldName)}
                      </p>
                    </div>
                  </Draggable>
                )}

                {uploadedImage && (
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-700 transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}

                {/* Pan mode toggle */}
                <button
                  type="button"
                  onClick={() => setIsPanning(!isPanning)}
                  className={`absolute bottom-2 right-2 p-1.5 rounded-full transition-colors ${
                    isPanning ? "bg-blue-500 text-white" : "bg-white text-gray-700 border border-gray-200"
                  }`}
                >
                  <Move size={16} />
                </button>
              </div>

              {/* T-shirt color selector */}
              <div className={`w-full p-4 rounded-xl border ${theme.borderColor} mb-6`}>
                <h2 className={`text-lg font-semibold mb-3 ${theme.textColor} flex items-center gap-2`}>
                  <Palette size={18} />
                  T-Shirt Color
                </h2>
                <div className="flex flex-wrap gap-2 justify-center">
                  {tshirtColors.map((color) => (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        selectedColor.name === color.name
                          ? "ring-2 ring-offset-2 ring-gray-400 scale-110"
                          : "hover:scale-105"
                      }`}
                      style={{ backgroundColor: color.value }}
                      aria-label={`Select ${color.name} color`}
                    />
                  ))}
                </div>
              </div>

              <div
                className={`w-full p-4 border-2 border-dashed rounded-xl text-center cursor-pointer transition-colors ${
                  isDragging ? "drag-active" : `${theme.borderColor} ${theme.inputBg}`
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input type="file" id="image-upload" accept="image/*" className="hidden" onChange={handleFileChange} />
                <label htmlFor="image-upload" className="cursor-pointer block">
                  <div className="flex flex-col items-center">
                    <Upload className={`mb-2 ${theme.textColor}`} />
                    <p className={`text-sm font-medium ${theme.textColor}`}>
                      Drop an image here or click to upload
                      <span className="block text-xs mt-1">
                        {currentView === "front" ? "(Front View)" : "(Back View)"}
                      </span>
                    </p>
                    {uploadedImage && (
                      <div className="mt-3 w-20 h-20 overflow-hidden rounded-lg border shadow-sm">
                        <img
                          src={uploadedImage || "/placeholder.svg"}
                          alt="Uploaded preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </label>
              </div>
            </div>

            {/* Customization Options */}
            <div className="md:col-span-2">
              <div className="grid grid-cols-1 gap-6">
                {/* Show Body Profile Section only in front view */}
                {currentView === "front" && (
                  <div className={`p-5 rounded-xl border ${theme.borderColor} ${theme.shadow}`}>
                    <h2 className={`text-lg font-semibold mb-4 ${theme.textColor}`}>Body Profile</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${theme.textColor}`}>Height (cm)</label>
                        <input
                          type="number"
                          {...frontForm.register("height", {
                            required: "Height is required",
                            min: {
                              value: 100,
                              message: "Height must be at least 100cm",
                            },
                            max: {
                              value: 250,
                              message: "Height must be at most 250cm",
                            },
                          })}
                          className={`w-full p-2.5 border rounded-lg ${theme.borderColor} ${theme.inputBg}`}
                        />
                        {frontForm.formState.errors.height && (
                          <p className="text-red-500 text-xs mt-1">{frontForm.formState.errors.height.message}</p>
                        )}
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-1 ${theme.textColor}`}>Weight (kg)</label>
                        <input
                          type="number"
                          {...frontForm.register("weight", {
                            required: "Weight is required",
                            min: {
                              value: 30,
                              message: "Weight must be at least 30kg",
                            },
                            max: {
                              value: 200,
                              message: "Weight must be at most 200kg",
                            },
                          })}
                          className={`w-full p-2.5 border rounded-lg ${theme.borderColor} ${theme.inputBg}`}
                        />
                        {frontForm.formState.errors.weight && (
                          <p className="text-red-500 text-xs mt-1">{frontForm.formState.errors.weight.message}</p>
                        )}
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-1 ${theme.textColor}`}>Build</label>
                        <select
                          {...frontForm.register("build", { required: "Build is required" })}
                          className={`w-full p-2.5 border rounded-lg ${theme.borderColor} ${theme.inputBg}`}
                        >
                          <option value="lean">Lean</option>
                          <option value="regular">Regular</option>
                          <option value="athletic">Athletic</option>
                          <option value="big">Big</option>
                        </select>
                        {frontForm.formState.errors.build && (
                          <p className="text-red-500 text-xs mt-1">{frontForm.formState.errors.build.message}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Show Size Selection only in front view */}
                {currentView === "front" && (
                  <div className={`p-5 rounded-xl border ${theme.borderColor} ${theme.shadow}`}>
                    <h2 className={`text-lg font-semibold mb-4 ${theme.textColor}`}>Size Selection</h2>
                    <div className="flex flex-wrap gap-3 justify-center">
                      {["XS", "S", "M", "L", "XL", "XXL"].map((size) => (
                        <label key={size} className="cursor-pointer">
                          <input type="radio" value={size} {...frontForm.register("size")} className="sr-only" />
                          <div
                            className={`px-4 py-2 rounded-lg border-2 transition-all ${
                              frontForm.watch("size") === size
                                ? `${theme.primaryColor} text-white border-transparent`
                                : `border-gray-200 ${theme.textColor} hover:border-gray-300`
                            }`}
                          >
                            {size}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Text Customization */}
                <div className={`p-5 rounded-xl border ${theme.borderColor} ${theme.shadow}`}>
                  <h2 className={`text-lg font-semibold mb-4 ${theme.textColor} flex items-center gap-2`}>
                    <Type size={18} />
                    Text Customization {currentView === "front" ? "(Front)" : "(Back)"}
                  </h2>

                  <textarea
                    {...register(textFieldName, {
                      maxLength: 100,
                      validate: {
                        maxLines: (value) => !value || value.split("\n").length <= 3 || "Maximum 3 lines allowed",
                      },
                    })}
                    placeholder={`Enter up to 3 lines of text to print on your t-shirt ${currentView === "front" ? "front" : "back"}`}
                    rows={3}
                    className={`w-full p-3 border rounded-lg ${theme.borderColor} ${theme.inputBg} mb-4`}
                  ></textarea>

                  <div className="flex justify-between mb-4">
                    <p className={`text-xs ${theme.textColor}`}>{watch(textFieldName)?.length || 0}/100 characters</p>
                    <p className={`text-xs ${theme.textColor}`}>
                      {watch(textFieldName)?.split("\n").length || 1}/3 lines
                    </p>
                  </div>

                  {errors[textFieldName] && (
                    <p className="text-red-500 text-xs mb-4">{errors[textFieldName].message || "Text is too long"}</p>
                  )}

                  {/* Text Styling Options */}
                  {watch(textFieldName) && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        {/* Font Family */}
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${theme.textColor}`}>Font</label>
                          <select
                            value={selectedFont.name}
                            onChange={(e) => setSelectedFont(fontOptions.find((f) => f.name === e.target.value))}
                            className={`w-full p-2 border rounded-lg ${theme.borderColor} ${theme.inputBg}`}
                          >
                            {fontOptions.map((font) => (
                              <option key={font.name} value={font.name}>
                                {font.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Font Size */}
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${theme.textColor}`}>Size</label>
                          <select
                            value={selectedFontSize.name}
                            onChange={(e) => setSelectedFontSize(fontSizes.find((s) => s.name === e.target.value))}
                            className={`w-full p-2 border rounded-lg ${theme.borderColor} ${theme.inputBg}`}
                          >
                            {fontSizes.map((size) => (
                              <option key={size.name} value={size.name}>
                                {size.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Font Color */}
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${theme.textColor}`}>Text Color</label>
                        <div className="flex flex-wrap gap-2">
                          {fontColors.map((color) => (
                            <button
                              key={color.name}
                              type="button"
                              onClick={() => setSelectedFontColor(color)}
                              className={`w-8 h-8 rounded-full border transition-all ${
                                selectedFontColor.name === color.name ? "ring-2 ring-offset-2 ring-gray-400" : ""
                              }`}
                              style={{ backgroundColor: color.value }}
                              aria-label={`Select ${color.name} text color`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Text Style */}
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={textIsBold}
                            onChange={() => setTextIsBold(!textIsBold)}
                            className="sr-only"
                          />
                          <div
                            className={`px-3 py-1.5 rounded border transition-all ${
                              textIsBold ? `${theme.primaryColor} text-white` : `border-gray-200 ${theme.textColor}`
                            }`}
                          >
                            <span className="font-bold">B</span>
                          </div>
                          <span className={`text-sm ${theme.textColor}`}>Bold</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={textIsItalic}
                            onChange={() => setTextIsItalic(!textIsItalic)}
                            className="sr-only"
                          />
                          <div
                            className={`px-3 py-1.5 rounded border transition-all ${
                              textIsItalic ? `${theme.primaryColor} text-white` : `border-gray-200 ${theme.textColor}`
                            }`}
                          >
                            <span className="italic">I</span>
                          </div>
                          <span className={`text-sm ${theme.textColor}`}>Italic</span>
                        </label>
                      </div>

                      {/* Text Position */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className={`text-sm font-medium ${theme.textColor} flex items-center gap-1`}>
                            <Move size={16} />
                            Text Position
                          </label>
                          <button
                            type="button"
                            onClick={resetTextPosition}
                            className={`text-xs ${theme.textColor} underline`}
                          >
                            Reset Position
                          </button>
                        </div>
                        <p className={`text-xs ${theme.textColor} mb-2`}>
                          Drag the text on the t-shirt to position it exactly where you want.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Theme Switcher */}
                <div className={`p-5 rounded-xl border ${theme.borderColor} ${theme.shadow}`}>
                  <h2 className={`text-lg font-semibold mb-4 ${theme.textColor}`}>Theme Options</h2>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <RefreshCw className={theme.textColor} size={18} />
                      <span className={`text-sm ${theme.textColor}`}>
                        Press <kbd className="px-2 py-1 bg-gray-100 rounded border">Alt + Q</kbd> to switch themes
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {themes.map((t, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setActiveTheme(index)}
                          className={`w-8 h-8 rounded-full ${t.primaryColor} ${
                            activeTheme === index ? "ring-2 ring-offset-2 ring-gray-400" : ""
                          }`}
                          aria-label={`Switch to ${t.name} theme`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className={`${theme.buttonColor} text-white py-3.5 px-6 rounded-xl font-medium transition-colors duration-300 flex items-center justify-center gap-2 shadow-lg`}
                >
                  <Save size={20} />
                  {editingId ? "Update Design" : "Save Design"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
