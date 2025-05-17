import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { modelStore } from "@/lib/chat-store";
import { db } from "@/lib/db";
import type {
	GeneralAppSettings,
	LLMModel,
	LLMProviderConfig,
} from "@/lib/models";
import { type RootRoute, createRoute } from "@tanstack/react-router";
import { useStore } from "@tanstack/react-store";
import { useLiveQuery } from "dexie-react-hooks";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const SettingsGeneral = () => {
	// State for models and providers
	const llmProviders = useLiveQuery<LLMProviderConfig[]>(() =>
		db.llmProviders?.toArray(),
	);
	const storeState = useStore(modelStore);
	const availableModels = storeState.models;
	const [isLoading, setIsLoading] = useState<boolean>(true);

	// Form state
	const [newModel, setNewModel] = useState({
		providerId: "",
		modelId: "",
	});

	// Settings state
	const [settings, setSettings] = useState<GeneralAppSettings>({
		id: "global",
		titleLlmProviderId: undefined,
		titleLlmModelId: "",
		chatLlmProviderId: undefined,
		chatLlmModelId: "",
	});

	// Load settings and available models
	useEffect(() => {
		const loadData = async () => {
			try {
				setIsLoading(true);

				// Load settings
				const savedSettings = await db.generalSettings.get("global");
				if (savedSettings) {
					setSettings(savedSettings);
				} else {
					// Initialize with default settings if not found
					const defaultSettings = {
						id: "global",
						titleLlmProviderId: "",
						titleLlmModelId: "",
						chatLlmProviderId: "",
						chatLlmModelId: "",
					};
					await db.generalSettings.add(defaultSettings);
					setSettings(defaultSettings);
				}

				// Load available models
				const models = (await db.llmModels.toArray()) ?? [];
				modelStore.setState((s) => ({ models: models as LLMModel[] }));
			} catch (err) {
				console.error("Error loading settings:", err);
				toast.error("Failed to load settings");
			} finally {
				setIsLoading(false);
			}
		};

		loadData();
	}, []);

	// Handle adding a new model
	const handleAddModel = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!newModel.providerId || !newModel.modelId) {
			toast.error("Please fill in all fields");
			return;
		}

		try {
			// Check if model already exists for this provider
			const exists = availableModels.some(
				(m) =>
					m.providerId === newModel.providerId &&
					m.modelId === newModel.modelId,
			);

			if (exists) {
				toast.error("This model already exists for the selected provider");
				return;
			}

			// Add new model
			const id = `${newModel.providerId}-${newModel.modelId}`;
			await db.llmModels.add({
				id,
				modelId: newModel.modelId,
				providerId: newModel.providerId,
				enabled: true,
			});

			// Refresh models list
			const updatedModels = await db.llmModels.toArray();
			modelStore.setState((s) => ({ models: updatedModels as LLMModel[] }));

			// Clear form
			setNewModel({ providerId: "", modelId: "" });
			toast.success("Model added successfully");
		} catch (err) {
			console.error("Error adding model:", err);
			toast.error("Failed to add model");
		}
	};

	// Update settings
	const updateSettings = async (updates: Partial<GeneralAppSettings>) => {
		try {
		
			await db.generalSettings.update("global", updates);
			setSettings({...settings,...updates});
			toast.success("Settings saved successfully");
		} catch (err) {
			console.error("Error updating settings:", err);
			toast.error("Failed to update settings");
		}
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-64">
				<Loader2 className="h-8 w-8 animate-spin" />
			</div>
		);
	}

	const onModelEnableChange = async (
		model: LLMModel,
		checked: boolean,
	): Promise<void> => {
		try {
			const newStatus = checked;
			await db.llmModels.update(model.id, { enabled: newStatus });
			// Update the store
			modelStore.setState((s) => ({
				models: s.models.map((m) =>
					m.id === model.id ? { ...m, enabled: newStatus } : m,
				),
			}));
			toast.success("Model status updated successfully");
		} catch (error) {
			toast.error("Failed to update model status");
			console.error("Failed to update model status:", error);
		}
	};
	return (
		<div className="flex w-full  justify-center">
			<div className="p-6 space-y-4 w-full max-w-6xl">
				<h1 className="text-3xl font-bold tracking-tight">LLM Settings</h1>
				<div className="flex flex-row flex-wrap gap-4 max-h-[calc(100vh-6rem)] overflow-y-auto">
					<div className="flex flex-col gap-4 w-[calc(50%-1rem)]">
						{/* Add New Model */}
						<Card>
							<CardHeader>
								<CardTitle>Add New Model</CardTitle>
								<CardDescription>
									Add a new LLM model to use for chat and title generation
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="provider">Provider</Label>
										<Select
											value={newModel.providerId}
											onValueChange={(value) =>
												setNewModel({ ...newModel, providerId: value })
											}
										>
											<SelectTrigger>
												<SelectValue placeholder="Select a provider" />
											</SelectTrigger>
											<SelectContent>
												{llmProviders?.map((provider) => (
													<SelectItem key={provider.id} value={provider.id}>
														{provider.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>

									<div className="space-y-2">
										<Label htmlFor="modelId">Model ID</Label>
										<div className="flex space-x-2">
											<Input
												id="modelId"
												placeholder="Enter model ID"
												value={newModel.modelId}
												onChange={(e) =>
													setNewModel({ ...newModel, modelId: e.target.value })
												}
												className="flex-1"
											/>
											<Button onClick={handleAddModel}>Add</Button>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Model Settings */}
						<Card>
							<CardHeader>
								<CardTitle>Model Settings</CardTitle>
								<CardDescription>
									Configure which models to use for different tasks
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								<div className="space-y-2">
									<h3 className="font-medium">Title Generation</h3>
									<div className="space-y-2">
										<Label>Model</Label>
										<Select
											value={`${settings.titleLlmProviderId}-${settings.titleLlmModelId || ""}`}
											onValueChange={(value) =>{
												const selectedModel = availableModels.find((model) => model.id === value)
												updateSettings({
													titleLlmModelId: selectedModel?.modelId || "",
													titleLlmProviderId: selectedModel?.providerId || "",
												})
											}}
										>
											<SelectTrigger>
												<SelectValue placeholder="Select a model" />
											</SelectTrigger>
											<SelectContent>
												{availableModels?.map((model) => (
													<SelectItem key={model.id} value={model.id}>
														{model.providerId} - {model.modelId}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
								</div>

								<div className="space-y-2">
									<h3 className="font-medium">Chat Generation</h3>
									<div className="space-y-2">
										<Label>Model</Label>
										<Select
											value={`${settings.chatLlmProviderId}-${settings.chatLlmModelId || ""}`}
											onValueChange={(value) =>{
												console.log(value)
												const selectedModel = availableModels.find(m=>m.id === value)
												updateSettings({
													chatLlmModelId: selectedModel?.modelId || "",
													chatLlmProviderId:selectedModel?.providerId || ""
												})
											}}
										>
											<SelectTrigger>
												<SelectValue placeholder="Select a model" />
											</SelectTrigger>
											<SelectContent>
												{availableModels?.map((model) => (
													<SelectItem key={model.id} value={model.id}>
														{model.providerId} - {model.modelId}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
					<div className="flex flex-col gap-4 w-[calc(50%-1rem)]">
						<Card>
							<CardHeader>
								<CardTitle>Available Models</CardTitle>
								<CardDescription>
									Enable or disable models for use in the application
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-2">
								{availableModels.map((model) => (
									<div
										key={model.id}
										className="flex items-center justify-between p-3 border rounded-lg"
									>
										<div className="space-y-1">
											<p className="font-medium">{model.modelId}</p>
											<p className="text-sm text-muted-foreground">
												{model.providerId} •{" "}
												{model.enabled ? "Enabled" : "Disabled"}
											</p>
										</div>
										<Switch
											checked={model.enabled}
											onCheckedChange={(checked) =>
												onModelEnableChange(model, checked)
											}
										/>
									</div>
								))}
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
};

export default (parentRoute: RootRoute) =>
	createRoute({
		path: "/settings/general",
		component: SettingsGeneral,
		getParentRoute: () => parentRoute,
	});
