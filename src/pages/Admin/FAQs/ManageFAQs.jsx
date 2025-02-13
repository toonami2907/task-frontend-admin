import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import adminApi from "@/services/API/adminAxiosConfig";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { faqFormSchema } from "@/functions/schema/schema";
import {
  Plus,
  Image as ImageIcon,
  Video,
  HelpCircle,
  Loader2,
  Pencil,
  Trash,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ManageFAQs = () => {
  const { toast } = useToast();
  const [faqs, setFaqs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingFaq, setEditingFaq] = useState(null);
  const [displayCount, setDisplayCount] = useState(2);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    control,
  } = useForm({
    resolver: zodResolver(faqFormSchema),
    defaultValues: {
      question: "",
      answer: "",
      category: "general",
      media: {
        type: "none",
        url: "",
      },
    },
  });

  const mediaType = watch("media.type");

  const fetchFAQs = async () => {
    setIsLoading(true);
    try {
      const response = await adminApi.get("/api/faq");
      setFaqs(response.data.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch FAQs",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFAQs();
  }, []);

  const handleDelete = async (id) => {
    try {
      await adminApi.delete(`/api/faq/${id}`);
      setFaqs(faqs.filter((faq) => faq._id !== id));
      toast({
        title: "Success",
        description: "FAQ deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete FAQ",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (faq) => {
    setEditingFaq(faq);
    reset({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      media: faq.media,
    });
  };

  const handleViewMore = () => {
    setDisplayCount((prevCount) => prevCount + 3);
  };

  const handleViewLess = () => {
    setDisplayCount(2);
  };
  const onSubmit = async (data) => {
    try {
      if (editingFaq) {
        const response = await adminApi.put(
          `/api/faq/${editingFaq._id}`,
          data
        );
        setFaqs(
          faqs.map((faq) =>
            faq._id === editingFaq._id ? response.data.data : faq
          )
        );
        setEditingFaq(null);
      } else {
        const response = await adminApi.post("/api/faq", data);
        setFaqs([...faqs, response.data.data]);
      }

      toast({
        title: "Success",
        description: `FAQ ${
          editingFaq ? "updated" : "created"
        } successfully`,
        className: "border-l-4 border-[#0F766E]",
      });
      reset();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message ||
          `Failed to ${editingFaq ? "update" : "create"} FAQ`,
        variant: "destructive",
      });
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      general: "bg-blue-100 text-blue-800",
      billing: "bg-green-100 text-green-800",
      technical: "bg-purple-100 text-purple-800",
      features: "bg-orange-100 text-orange-800",
    };
    return colors[category] || colors.general;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <HelpCircle className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Manage FAQs
            </h1>
          </div>
          {editingFaq && (
            <Button
              variant="outline"
              onClick={() => {
                reset();
                setEditingFaq(null);
              }}
              className="flex items-center space-x-2"
            >
              <X className="w-4 h-4" />
              <span>Cancel Editing</span>
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="bg-white rounded-xl shadow-sm max-h-[600px] p-6 border border-gray-100">
            <h2 className="text-xl font-semibold mb-6 text-gray-800">
              {editingFaq ? "Edit FAQ" : "Create New FAQ"}
            </h2>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Question
                </label>
                <Input
                  {...register("question")}
                  placeholder="Enter your question here"
                  className="w-full"
                />
                {errors.question && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.question.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Answer
                </label>
                <Textarea
                  {...register("answer")}
                  placeholder="Provide a detailed answer"
                  className="min-h-[120px]"
                />
                {errors.answer && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.answer.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">
                          General
                        </SelectItem>
                        <SelectItem value="billing">
                          Billing
                        </SelectItem>
                        <SelectItem value="technical">
                          Technical
                        </SelectItem>
                        <SelectItem value="features">
                          Features
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Media Type
                </label>
                <Controller
                  name="media.type"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select media type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Media</SelectItem>
                        <SelectItem value="image">Image</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {mediaType !== "none" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {mediaType === "image"
                      ? "Image URL"
                      : "Video URL"}
                  </label>
                  <div className="flex items-center space-x-2">
                    {mediaType === "image" ? (
                      <ImageIcon className="w-5 h-5 text-gray-400" />
                    ) : (
                      <Video className="w-5 h-5 text-gray-400" />
                    )}
                    <Input
                      {...register("media.url")}
                      placeholder={`Enter ${mediaType} URL`}
                    />
                  </div>
                  {errors.media?.url && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.media.url.message}
                    </p>
                  )}
                </div>
              )}

              {/* Preview section */}
              {watch("media.url") && (
                <div className="border border-gray-100 rounded-lg p-4 bg-gray-50">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Media Preview
                  </h3>
                  {watch("media.type") === "image" ? (
                    <img
                      src={watch("media.url")}
                      alt="FAQ illustration"
                      className="rounded-lg max-w-full h-auto"
                    />
                  ) : (
                    <iframe
                      src={watch("media.url")}
                      className="w-full aspect-video rounded-lg"
                      allowFullScreen
                    />
                  )}
                </div>
              )}

              <Button type="submit" className="w-full">
                {editingFaq ? (
                  <>
                    <Pencil className="w-4 h-4 mr-2" />
                    Update FAQ
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create FAQ
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* FAQs List Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Existing FAQs
            </h2>
            {isLoading ? (
              <div className="flex items-center justify-center h-64 bg-white rounded-xl border border-gray-100">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : faqs.length > 0 ? (
              <div className="space-y-4">
                {faqs.slice(0, displayCount).map((faq) => (
                  <div
                    key={faq._id}
                    className="bg-white rounded-xl p-6  shadow-sm border border-gray-100 transition-all hover:shadow-md"
                  >
                    <div className="flex justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">
                          {faq.question}
                        </h3>
                        <p className="text-gray-600 mt-2 text-sm">
                          {faq.answer}
                        </p>
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-3 ${getCategoryColor(
                            faq.category
                          )}`}
                        >
                          {faq.category}
                        </span>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(faq)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(faq._id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {faq.media?.url && (
                      <div className="mt-4">
                        {faq.media.type === "image" ? (
                          <img
                            src={faq.media.url}
                            alt="FAQ illustration"
                            className="rounded-lg max-w-full h-auto"
                          />
                        ) : (
                          <iframe
                            src={faq.media.url}
                            className="w-full aspect-video rounded-lg"
                            allowFullScreen
                          />
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {faqs.length > displayCount && (
                  <Button
                    variant="outline"
                    className="w-full mt-4 flex items-center justify-center"
                    onClick={handleViewMore}
                  >
                    <ChevronDown className="w-4 h-4 mr-2" />
                    View More {faqs?.length - displayCount}  
                  </Button>
                )}
                {displayCount > 3 && (
                  <Button
                    variant="outline"
                    onClick={handleViewLess}
                    className="flex items-center gap-2"
                  >
                    <ChevronUp className="w-4 h-4" />
                    View Less
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No FAQs created yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageFAQs;
