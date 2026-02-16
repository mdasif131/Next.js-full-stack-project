'use client';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { useState } from 'react';
import { createJobApplication } from '@/lib/actions/jobApplication';


interface CreateJobApplicationDialogProps {
  columnId: string;
  boardId: string;
}
const INITIAL_FORM_DATA = {
  company: '',
  position: '',
  location: '',
  notes: '',
  salary: '',
  jobUrl: '',
  tags: '',
  description: '',
};
const CreateJobDialog = ({
  columnId,
  boardId,
}: CreateJobApplicationDialogProps) => {
  const [open, setOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await createJobApplication({
        ...formData,
        columnId,
        boardId,
        tags: formData.tags.split(',').map(tag=> tag.trim()).filter(tag=> tag.length > 0)
      });
      if (!result.error) {
        setFormData(INITIAL_FORM_DATA);
        setOpen(false)
      } else {
        console.error(result.error);
      }
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus />
          Add Job
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle> Add Job Application</DialogTitle>
          <DialogDescription>Track a new job application</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company">Company *</Label>
                <Input
                  id="company"
                  required
                  value={formData.company}
                  onChange={e =>
                    setFormData({ ...formData, company: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">Position *</Label>
                <Input
                  id="position"
                  required
                  value={formData.position}
                  onChange={e =>
                    setFormData({ ...formData, position: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location </Label>
                <Input
                  id="location"
                  required
                  value={formData.location}
                  onChange={e =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salary">Salary </Label>
                <Input
                  id="salary"
                  placeholder="e.g., $100k - $150k"
                  required
                  value={formData.salary}
                  onChange={e =>
                    setFormData({ ...formData, salary: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="jobUrl">Job URL </Label>
              <Input
                id="jobUrl"
                placeholder="https://..."
                required
                value={formData.jobUrl}
                onChange={e =>
                  setFormData({ ...formData, jobUrl: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (coma-separated)</Label>
              <Input
                id="tags"
                placeholder="React, Tailwind, Node.js ..."
                required
                value={formData.tags}
                onChange={e =>
                  setFormData({ ...formData, tags: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter Description"
                rows={3}
                value={formData.description}
                onChange={e =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                rows={4}
                value={formData.notes}
                onChange={e =>
                  setFormData({ ...formData, notes: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Add Application</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateJobDialog;
