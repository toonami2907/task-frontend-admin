import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"

export const MailComposer = () => {
  const [selectedEmails, setSelectedEmails] = useState([])
  const [mailData, setMailData] = useState({
    subject: '',
    preheader: '',
    greeting: '',
    userName: '',
    companyName: '',
    mainContent: '',
    callToAction: '',
    buttonText: '',
    buttonUrl: '',
    signatureText: '',
    utm_source: '',
    utm_medium: '',
    utm_campaign: ''
  })

  // Demo user list - replace with actual user data
  const users = [
    { id: 1, name: 'John Doe', email: 'john@example.com', company: 'Tech Corp' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', company: 'Digital Inc' },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', company: 'Web Solutions' }
  ]

  const handleUserSelect = (user) => {
    setSelectedEmails(prev => 
      prev.includes(user.email) 
        ? prev.filter(e => e !== user.email)
        : [...prev, user.email]
    )
  }

  const handleInputChange = (e) => {
    setMailData({
      ...mailData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">Promotional Email Composer</h2>

      <Tabs defaultValue="recipients" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recipients">Recipients</TabsTrigger>
          <TabsTrigger value="content">Email Content</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="recipients">
          <Card>
            <CardHeader>
              <CardTitle>Select Recipients</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px] mb-4">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center space-x-2 p-2 border-b">
                    <Checkbox
                      checked={selectedEmails.includes(user.email)}
                      onCheckedChange={() => handleUserSelect(user)}
                    />
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                      <p className="text-xs text-gray-400">{user.company}</p>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content">
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>Email Subject</Label>
                  <Input
                    name="subject"
                    placeholder="Enter engaging subject line"
                    value={mailData.subject}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Preheader Text</Label>
                  <Input
                    name="preheader"
                    placeholder="Brief preview text that appears in email clients"
                    value={mailData.preheader}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Greeting</Label>
                  <Input
                    name="greeting"
                    placeholder="e.g., Hi {firstName},"
                    value={mailData.greeting}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Main Content</Label>
                  <Textarea
                    name="mainContent"
                    placeholder="Your main promotional message..."
                    className="min-h-[200px]"
                    value={mailData.mainContent}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>CTA Button Text</Label>
                    <Input
                      name="buttonText"
                      placeholder="e.g., Shop Now"
                      value={mailData.buttonText}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>CTA Button URL</Label>
                    <Input
                      name="buttonUrl"
                      placeholder="https://..."
                      value={mailData.buttonUrl}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Email Signature</Label>
                  <Textarea
                    name="signatureText"
                    placeholder="Your signature block..."
                    value={mailData.signatureText}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview">
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div className="border p-4 rounded-lg">
                <h3 className="font-bold">{mailData.subject || "Subject Line"}</h3>
                <p className="text-sm text-gray-500">{mailData.preheader || "Preheader text"}</p>
                <div className="mt-4 space-y-4">
                  <p>{mailData.greeting || "Greeting"}</p>
                  <div className="whitespace-pre-wrap">{mailData.mainContent || "Main content"}</div>
                  {mailData.buttonText && (
                    <Button className="mt-4">{mailData.buttonText}</Button>
                  )}
                  <div className="mt-4 text-sm">{mailData.signatureText || "Signature"}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6">
        <Button 
          className="w-full"
          disabled={selectedEmails.length === 0 || !mailData.subject || !mailData.mainContent}
        >
          Send Promotional Email ({selectedEmails.length} recipients)
        </Button>
      </div>
    </div>
  )
}

export default MailComposer
